import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment/moment';
import QuestionCard from '../../Components/Cards/QuestionCard';
import { AnimatePresence, motion, spring } from 'framer-motion';
import toast from 'react-hot-toast';
import Dashboardlayout from '../../Components/layout/Dashboardlayout';
import RoleinfoHeader from '../../Components/RoleinfoHeader';
import Drawer from '../../Components/layout/loader/Drawer';
import SkeletonLoader from './SkeletonLoader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuCircleAlert, LuListCollapse } from 'react-icons/lu';
import AIResponsePreview from '../../Components/AIResponsePreview';
import SpinnerLoader from '../../Components/layout/loader/SpinnerLoader';

const InterviewPrep = () => {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [openLeanMoreDrawer, setOpenLeanMoreDrawer] = useState(false);
  const [isUpdatLoader, setIsUpdateLoader] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestionForExplanation, setSelectedQuestionForExplanation] = useState(null); // New state to hold the question for explanation

  // Add a state to track current screen size (for responsive rendering)
  const [isMobile, setIsMobile] = useState(false);

  // Effect to determine if it's a mobile screen
  useEffect(() => {
    const handleResize = () => {
      // Tailwind's 'md' breakpoint is typically 768px.
      // We'll consider anything below 'md' as mobile for this logic.
      setIsMobile(window.innerWidth < 768);
    };

    // Set initial value
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up event listener
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Fetch session data by session id
  const fetchSessionDetailsById = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));

      if (response.data && response.data.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error('Error fetching session data:', error);
      setErrorMsg('Failed to fetch session data');
      toast.error('Failed to fetch session data');
    }
  };

  // Generate Concept Explanation
  const generateConceptExplanation = async (question) => {
    // If on mobile, clear previous explanation and set the selected question
    if (isMobile) {
      setExplanation(null);
      setSelectedQuestionForExplanation(question);
    } else {
      // For larger screens, open the drawer
      setOpenLeanMoreDrawer(true);
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_EXPLANATION, {
        question,
      });

      if (response.data) {
        setExplanation(response.data);
      } else {
        setErrorMsg('No explanation data received.');
        toast.error('No explanation data received.');
      }
    } catch (error) {
      setExplanation(null);
      setErrorMsg("Failed to generate explanation. Please try again later.");
      toast.error("Failed to generate explanation. Please try again later.");
      console.error('Error generating explanation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Pin Question toggle
  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));

      if (response.data && response.data.isPinned !== undefined) {
        toast.success('Question pin status toggled successfully!');
        fetchSessionDetailsById();
      } else {
        toast.error('Unexpected response from server when toggling pin status.');
      }
    } catch (error) {
      console.error('Error toggling question pin status:', error);
      toast.error('Failed to toggle question pin status. Please try again.');
    }
  };

  // Add more question to a session
  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);

      const AIResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
        role: sessionData?.role,
        experience: sessionData?.experience,
        topicsToFocus: sessionData?.topicsToFocus,
        numberOfQuestions: 10,
      });

      const generateQuestions = AIResponse.data;
      const response = await axiosInstance.post(API_PATHS.QUESTION.ADD_TO_SESSION, {
        sessionId,
        questions: generateQuestions
      });

      if (response.data) {
        toast.success("Added More Q & A ");
        fetchSessionDetailsById();
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("something Went Wrong,Please try again..");
      }
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchSessionDetailsById();
    }
  }, [sessionId]);

  console.log(sessionData);

  return (
    <Dashboardlayout>
      <RoleinfoHeader
        role={sessionData?.role || ''}
        topicsToFocus={sessionData?.topicsToFocus || ''}
        experience={sessionData?.experience || ''}
        questions={sessionData?.questions?.length || '-'}
        description={sessionData?.description || ''}
        lastUpdatted={
          sessionData?.updatedAt ? moment(sessionData.updatedAt).format('DD MMM YYYY') : ''
        }
      />
      <div className='Container mx-auto pt-4 pb-4 md:px-0'>
        <h2 className='text-lg font-semibold color-black'>Interview Q & A</h2>
        <div className='grid grid-cols-12 gap-4 mt-5 mb-10'>
          {/* Main content area for questions */}
          <div className={`col-span-12 ${openLeanMoreDrawer && !isMobile ? 'md:col-span-8' : 'md:col-span-12'}`}>
            <AnimatePresence>
              {sessionData?.questions?.map((data, index) => (
                <motion.div
                  key={data._id || index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.4,
                    type: spring,
                    stiffness: 100,
                    delay: index * 0.1,
                    damping: 15,
                  }}
                  layout
                  layoutId={`question-${data._id || index}`}
                >
                  <QuestionCard
                    question={Array.isArray(data.question) ? data.question.join(' ') : data.question}
                    answer={data.answer}
                    isPinned={data.isPinned}
                    onTogglePin={() => toggleQuestionPinStatus(data._id)}
                    onLearnMore={() => generateConceptExplanation(data.question)}
                  />

                  {/* Render explanation directly below the question on mobile */}
                  {isMobile && selectedQuestionForExplanation === data.question && (
                    <div className="mt-4 p-4 bg-white rounded-lg shadow-md border border-gray-200">
                      <h3 className="text-md font-semibold mb-2">Concept Explanation</h3>
                      {errorMsg && (
                        <p className='flex items-center gap-2 text-red-600'>
                          <LuCircleAlert className='mt-0.5' /> {errorMsg}
                        </p>
                      )}
                      {isLoading && <SkeletonLoader />}
                      {!isLoading && explanation && (
                        <AIResponsePreview content={explanation.explanation} />
                      )}
                      {!isLoading && !explanation && !errorMsg && (
                         <p className="text-gray-500">No explanation available for this question.</p>
                      )}
                    </div>
                  )}

                  {!isLoading && sessionData?.questions?.length === index + 1 && (
                    <div className='flex items-center justify-center mt-5'>
                      <button
                        className='flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 rounded text-nowrap cursor-pointer '
                        disabled={isLoading || isUpdatLoader}
                        onClick={uploadMoreQuestions}
                      >
                        {isUpdatLoader ? (<SpinnerLoader />) :
                          (<LuListCollapse className='text-lg' />)}
                        {' '}
                        Load More
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* This column is for the drawer on larger screens */}
          {openLeanMoreDrawer && !isMobile && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="col-span-12 md:col-span-4"
            >
                {/* We can optionally render a placeholder or a preview here if needed */}
            </motion.div>
          )}
        </div>
      </div>

      {/* The Drawer component, rendered only on non-mobile screens */}
      {!isMobile && (
        <Drawer
          isOpen={openLeanMoreDrawer}
          onClose={() => setOpenLeanMoreDrawer(false)}
          title={!isLoading && explanation ? explanation.title : (isLoading ? "Loading Explanation..." : "Concept Explanation")}
        >
          {errorMsg && (
            <p className='flex items-center gap-2 text-red-600'>
              <LuCircleAlert className='mt-0.5' /> {errorMsg}
            </p>
          )}
          {isLoading && <SkeletonLoader />}
          {!isLoading && explanation && (
            <AIResponsePreview content={explanation.explanation} />
          )}
        </Drawer>
      )}
    </Dashboardlayout>
  );
};

export default InterviewPrep; 