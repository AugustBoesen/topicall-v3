/* eslint-disable react-hooks/rules-of-hooks */
'use client';
import { useState, useEffect } from 'react';
import { fetchedQuestions } from './interface/fetchQuestions';
import { motion, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';
import { RotatingLines } from 'react-loader-spinner';
import { CiSettings } from 'react-icons/ci';
import Link from 'next/link';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<{ id: number; text: string }[]>([]);
  const [color, setColor] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [randomOrder, toggleRandomOrder] = useState(false);

  const [questionsData, setQuestionsData] = useState<
    { id: number; text: string }[]
  >([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setQuestionsData([{ id: -1, text: '' }]);
      try {
        const data: any = await fetchedQuestions();
        setQuestionsData(data);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };

    fetchQuestions();
  }, []);
  let current = questionsData[currentIndex] || {};

  // Toggle whether the next question is randomized in order or not
  function toggleRandom() {
    toggleRandomOrder(!randomOrder);
  }

  // Toggles the setting & navigation menu
  function toggleMenu() {
    setIsSettingsOpen(!isSettingsOpen);
  }

  //   Converts question text string to card background color
  const stringToColor = (str: string) => {
    if (!str) {
      return '';
    }
    let hash = 0;
    str.split('').forEach((char) => {
      hash = char.charCodeAt(0) + ((hash << 5) - hash);
    });
    let colour = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      colour += value.toString(16).padStart(2, '0');
    }
    return colour;
  };

  //______________________________________
  //   PRIMARY FUNCTIONS
  //______________________________________
  function nextQuestion() {
    setHistory((prevHistory) => [...prevHistory, current]);
    setCurrentIndex((prevIndex) => {
      let randomIndex: number;
      if (randomOrder) {
        randomIndex = Math.floor(Math.random() * questionsData.length);
      } else {
        randomIndex = prevIndex + 1;
        if (randomIndex >= questionsData.length) {
          randomIndex = 1;
        }
      }
      //   Next question cannot be previous question
      while (randomIndex === prevIndex) {
        randomIndex = Math.floor(Math.random() * questionsData.length);
      }
      //   Next question cannot be the initial question
      while (randomIndex === 0) {
        randomIndex = Math.floor(Math.random() * questionsData.length);
      }
      console.log(history);
      return randomIndex;
    });
    setColor(stringToColor(current.text));
  }

  function prevQuestion() {
    if (history.length === 0) return;
    setCurrentIndex((prevIndex) => {
      prevIndex = history.pop()!.id;
      return prevIndex;
    });
    setColor(stringToColor(current.text));
  }

  //______________________________________
  //   SWIPE FUNCTIONS
  //______________________________________
  const x = useMotionValue(0);
  const rotation = useMotionValue(0);
  useMotionValueEvent(x, 'animationStart', () => {
    console.log('animation started on x');
    if (x.get() > 20) {
      nextQuestion();
    }
    if (x.get() < -20) {
      prevQuestion();
    }
  });

  useMotionValueEvent(x, 'change', (latest) => {
    rotation.set(latest * 0.05);
  });

  return (
    <div className='app-container'>
      <div className='card-pile' />
      <div className='card-border' />
      <motion.div
        style={{ x, rotate: rotation, backgroundColor: color }}
        animate={{}}
        drag='x'
        dragConstraints={{ left: 0, right: 0 }}
        className={`card`}
      >
        <div className='card bg-black bg-opacity-30'>
          <h1>Question #{current.id}</h1>
          <h2>{current.text}</h2>
          {current.text === '' && <RotatingLines strokeColor='white' />}
        </div>
      </motion.div>
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className='menu'
        >
          <div className='w-full flex justify-around mb-6'>
            <Link className='linkbtn' href='/submit'>
              Suggest
            </Link>
            <Link className='linkbtn' href='/about'>
              About
            </Link>
          </div>
          <input
            type='checkbox'
            id='randomOrder'
            name='randomOrder'
            onChange={toggleRandom}
          />
          <label htmlFor='randomOrder' className='w-full text-center'>
            Randomized question order
          </label>
        </motion.div>
      )}
      <div className='buttondiv'>
        <button onClick={prevQuestion}>
          {<FaArrowAltCircleLeft className='text-red-100' />}
        </button>
        <button onClick={toggleMenu}> {<CiSettings />}</button>
        <button onClick={nextQuestion}>
          {<FaArrowAltCircleRight className='text-green-100' />}
        </button>
      </div>
    </div>
  );
}
