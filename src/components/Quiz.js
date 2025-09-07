import React, { useState } from "react";
import { useDB } from "../context/InMemoryDB";

const questions = [
  {
    q: "What does TVET stand for?",
    a: "Technical and Vocational Education and Training",
    options: ["Technical Vocational Education and Training", "Technology and Vocational Education and Training", "Technical and Vocational Education and Training"],
    link: "https://example.com/tvet-meaning",
  },
  {
    q: "What is the primary goal of TVET?",
    a: "To provide practical skills for employment",
    options: ["To provide theoretical knowledge", "To provide practical skills for employment", "To prepare students for university"],
    link: "https://example.com/tvet-goal",
  },
  // Add 18 more questions here...
];

export default function Quiz() {
  const { addQuizWinner } = useDB();
  const [round, setRound] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [message, setMessage] = useState("");
  const [participantInfo, setParticipantInfo] = useState({ phone: "", name: "" });
  const [started, setStarted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleStartQuiz = (e) => {
    e.preventDefault();
    if (participantInfo.phone && participantInfo.name) {
      setStarted(true);
      setMessage("");
    } else {
      setMessage("Please enter your name and phone number to start.");
    }
  };

  const handleAnswer = (selectedAnswer) => {
    if (showAnswer) return; // Prevent multiple clicks

    if (selectedAnswer === currentQuestion.a) {
      setScore(score + 5);
      setMessage("Correct!");
    } else {
      setMessage("Wrong answer. See the correct answer and a link to learn more.");
    }
    setShowAnswer(true);

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowAnswer(false);
        setMessage("");
      } else {
        setShowResult(true);
        if (score + (selectedAnswer === currentQuestion.a ? 5 : 0) >= 75) {
          addQuizWinner({ ...participantInfo, finalScore: score + (selectedAnswer === currentQuestion.a ? 5 : 0) });
        }
      }
    }, 2000);
  };
  
  const handleRestartQuiz = () => {
    if (round >= 2) {
      setMessage("You have completed your two rounds for the prize. You can continue, but without a prize.");
    }
    setRound(round + 1);
    setScore(0);
    setCurrentQuestionIndex(0);
    setShowResult(false);
    setShowAnswer(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText("Join TVET Connect quiz and win 200 RWF! [Link to your website]");
    alert("Link copied to clipboard! Share it with friends.");
  };

  if (!started) {
    return (
      <form onSubmit={handleStartQuiz}>
        <input
          type="tel"
          placeholder="Phone Number"
          value={participantInfo.phone}
          onChange={(e) => setParticipantInfo({ ...participantInfo, phone: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Your Name"
          value={participantInfo.name}
          onChange={(e) => setParticipantInfo({ ...participantInfo, name: e.target.value })}
          required
        />
        <button type="submit">Start Quiz</button>
        <p>{message}</p>
      </form>
    );
  }

  if (showResult) {
    const finalScore = score;
    const isWinner = finalScore >= 75 && round <= 2;
    return (
      <div>
        <h2>Quiz Complete!</h2>
        <p>Your score is: {finalScore}%</p>
        {isWinner ? (
          <div>
            <p>Congratulations, you are a winner! Your details have been sent to RTB for your 200 RWF prize.</p>
            <p>A button to share with friends will automatically appear.</p>
          </div>
        ) : (
          <p>You did not win a prize. Try again next round!</p>
        )}
        <button onClick={handleRestartQuiz}>Start Round {round + 1}</button>
        <button onClick={handleShare}>Share & Invite Friends</button>
      </div>
    );
  }

  return (
    <div>
      <h3>Question {currentQuestionIndex + 1} of {questions.length}</h3>
      <p>{currentQuestion.q}</p>
      <div className="options">
        {currentQuestion.options.map((option, index) => (
          <button key={index} onClick={() => handleAnswer(option)}>
            {option}
          </button>
        ))}
      </div>
      {showAnswer && (
        <div style={{ marginTop: "10px" }}>
          <p style={{ color: currentQuestion.a === message.split('.')[0] ? 'green' : 'red' }}>
            {message}
          </p>
          {currentQuestion.a !== message.split('.')[0] && (
            <p>The correct answer is: <strong>{currentQuestion.a}</strong></p>
          )}
          <a href={currentQuestion.link} target="_blank" rel="noopener noreferrer">
            Learn more about TVET
          </a>
        </div>
      )}
    </div>
  );
}