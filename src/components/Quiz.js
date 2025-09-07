import React, { useState } from "react";
import { useDB } from "../context/InMemoryDB";

const allQuestions = [
  { q: "What does TVET stand for?", a: "Technical and Vocational Education and Training", options: ["Technical Vocational Education and Training", "Technology and Vocational Education and Training", "Technical and Vocational Education and Training"], link: "https://www.rtb.gov.rw/about-us" },
  { q: "What is the primary goal of TVET?", a: "To provide practical skills for employment", options: ["To provide theoretical knowledge", "To provide practical skills for employment", "To prepare students for university"], link: "https://www.rtb.gov.rw/about-us" },
  { q: "In Rwanda, which government body oversees TVET?", a: "Rwanda TVET Board (RTB)", options: ["Ministry of Education", "Rwanda TVET Board (RTB)", "Rwanda Development Board (RDB)"], link: "https://www.rtb.gov.rw/" },
  { q: "What is a key benefit of TVET for an individual?", a: "Improved employability and income", options: ["Obtaining a bachelor's degree", "Improved employability and income", "Qualifying for a government job"], link: "https://www.rtb.gov.rw/benefits" },
  { q: "Which of the following is an example of a TVET field?", a: "Culinary Arts", options: ["Literature", "Physics", "Culinary Arts"], link: "https://www.rtb.gov.rw/fields" },
  { q: "How does TVET contribute to economic development?", a: "By creating a skilled workforce", options: ["By encouraging tourism", "By creating a skilled workforce", "By promoting agriculture"], link: "https://www.rtb.gov.rw/economy" },
  { q: "What is an apprenticeship?", a: "A system of training in a skilled trade", options: ["A short-term job", "A system of training in a skilled trade", "A full-time university course"], link: "https://www.rtb.gov.rw/apprenticeship" },
  { q: "What is the highest level of TVET qualification in Rwanda?", a: "Advanced Diploma", options: ["Certificate", "Diploma", "Advanced Diploma"], link: "https://www.rtb.gov.rw/qualifications" },
  { q: "Which of these is not a TVET sector?", a: "Law", options: ["Construction", "Automotive Mechanics", "Law"], link: "https://www.rtb.gov.rw/sectors" },
  { q: "What role does RTB play in TVET?", a: "Developing and implementing TVET policies", options: ["Building schools", "Providing loans to students", "Developing and implementing TVET policies"], link: "https://www.rtb.gov.rw/role" },
  { q: "What is the main difference between TVET and academic education?", a: "TVET focuses on practical skills", options: ["TVET is more expensive", "TVET focuses on practical skills", "Academic education is shorter"], link: "https://www.rtb.gov.rw/difference" },
  { q: "What is a TVET school commonly known as?", a: "Integrated Polytechnic Regional Centre (IPRC)", options: ["High School", "Integrated Polytechnic Regional Centre (IPRC)", "University"], link: "https://www.rtb.gov.rw/schools" },
  { q: "What is the purpose of a TVET curriculum?", a: "To meet the needs of the labor market", options: ["To teach history and geography", "To meet the needs of the labor market", "To prepare students for a general exam"], link: "https://www.rtb.gov.rw/curriculum" },
  { q: "What is 'competence-based training' in TVET?", a: "Training focused on achieving specific skills", options: ["Training based on books", "Training focused on achieving specific skills", "Training that is theory-heavy"], link: "https://www.rtb.gov.rw/competence" },
  { q: "Which is a common TVET field?", a: "Welding", options: ["Astronomy", "Philosophy", "Welding"], link: "https://www.rtb.gov.rw/welding" },
  { q: "How does TVET help to reduce youth unemployment?", a: "By equipping youth with job-ready skills", options: ["By giving them money", "By encouraging them to stay home", "By equipping youth with job-ready skills"], link: "https://www.rtb.gov.rw/unemployment" },
  { q: "What is a 'master craftsperson' in TVET?", a: "An experienced practitioner who trains others", options: ["A school director", "An experienced practitioner who trains others", "A government official"], link: "https://www.rtb.gov.rw/master" },
  { q: "Which of these is a vocational skill?", a: "Plumbing", options: ["Poetry writing", "Plumbing", "Public speaking"], link: "https://www.rtb.gov.rw/plumbing" },
  { q: "What is the role of industry in TVET?", a: "To provide practical training and feedback", options: ["To fund the schools", "To provide practical training and feedback", "To recruit teachers"], link: "https://www.rtb.gov.rw/industry" },
  { q: "What is a TVET graduate prepared for?", a: "Immediate employment or self-employment", options: ["Academic research", "Immediate employment or self-employment", "A career in politics"], link: "https://www.rtb.gov.rw/graduate" },
  { q: "What does IPRC stand for?", a: "Integrated Polytechnic Regional Centre", options: ["International Polytechnic Regional Centre", "Integrated Public Resource Center", "Integrated Polytechnic Regional Centre"], link: "https://www.rtb.gov.rw/iprc" },
  { q: "What is the main focus of a TVET curriculum?", a: "Work-based learning", options: ["Theory and history", "Work-based learning", "General knowledge"], link: "https://www.rtb.gov.rw/curriculum" },
  { q: "How does TVET promote entrepreneurship?", a: "By teaching skills for starting a business", options: ["By providing free loans", "By teaching skills for starting a business", "By giving certificates to everyone"], link: "https://www.rtb.gov.rw/entrepreneurship" },
  { q: "What is a 'short-course' in TVET?", a: "A specialized training program", options: ["A university lecture", "A specialized training program", "A course that lasts only one day"], link: "https://www.rtb.gov.rw/short-course" },
  { q: "Which of these is a TVET-related field?", a: "Automotive Mechanics", options: ["Archaeology", "Linguistics", "Automotive Mechanics"], link: "https://www.rtb.gov.rw/automotive" },
  { q: "What is the role of a TVET school's industry partnership?", a: "To ensure training is relevant to market needs", options: ["To organize student trips", "To ensure training is relevant to market needs", "To manage school finances"], link: "https://www.rtb.gov.rw/partnership" },
  { q: "What is the key benefit of a TVET certificate?", a: "It validates practical skills", options: ["It is a requirement for a passport", "It is only useful for high-paying jobs", "It validates practical skills"], link: "https://www.rtb.gov.rw/certificate" },
  { q: "What does CBET stand for?", a: "Competence-Based Education and Training", options: ["Certificate-Based Education and Training", "Competence-Based Education and Training", "Computer-Based Education and Training"], link: "https://www.rtb.gov.rw/cbet" },
  { q: "Which of these is a TVET discipline?", a: "Carpentry", options: ["Poetry", "Carpentry", "Astronomy"], link: "https://www.rtb.gov.rw/carpentry" },
  { q: "How does TVET address skill shortages?", a: "By training people in high-demand areas", options: ["By importing foreign workers", "By training people in high-demand areas", "By making skills a requirement for all jobs"], link: "https://www.rtb.gov.rw/skill-shortages" },
  { q: "What is a dual training system in TVET?", a: "Training both in school and at a company", options: ["Training in two different countries", "Training both in school and at a company", "Training for two different diplomas"], link: "https://www.rtb.gov.rw/dual-training" },
  { q: "Which of these is a TVET specialization?", a: "Solar Energy Installation", options: ["Space Exploration", "Solar Energy Installation", "Ancient History"], link: "https://www.rtb.gov.rw/solar-energy" },
  { q: "What is the purpose of an internship in TVET?", a: "To gain real-world work experience", options: ["To earn a salary", "To gain real-world work experience", "To find a part-time job"], link: "https://www.rtb.gov.rw/internship" },
  { q: "Which is a characteristic of TVET graduates?", a: "They are highly practical", options: ["They are highly practical", "They have only theoretical knowledge", "They are not interested in further education"], link: "https://www.rtb.gov.rw/graduates" },
  { q: "How does TVET contribute to poverty reduction?", a: "By enabling self-employment", options: ["By giving free money to people", "By enabling self-employment", "By creating new government jobs"], link: "https://www.rtb.gov.rw/poverty-reduction" },
  { q: "What is the role of a 'mentor' in TVET?", a: "To provide guidance and support", options: ["To teach a class", "To provide guidance and support", "To write the curriculum"], link: "https://www.rtb.gov.rw/mentor" },
  { q: "Which of these is a TVET-related course?", a: "Hairdressing", options: ["Music Composition", "Hairdressing", "Theoretical Physics"], link: "https://www.rtb.gov.rw/hairdressing" },
  { q: "What is the 'National TVET Qualification Framework'?", a: "A system for standardizing TVET qualifications", options: ["A list of all TVET schools", "A system for standardizing TVET qualifications", "A database of all TVET students"], link: "https://www.rtb.gov.rw/qualification-framework" },
  { q: "How does TVET promote innovation?", a: "By teaching creative problem-solving skills", options: ["By encouraging rote learning", "By teaching creative problem-solving skills", "By focusing on traditional methods only"], link: "https://www.rtb.gov.rw/innovation" },
  { q: "What is a 'skill gap' in the labor market?", a: "A mismatch between skills demanded and skills available", options: ["A lack of available jobs", "A mismatch between skills demanded and skills available", "A shortage of workers"], link: "https://www.rtb.gov.rw/skill-gap" },
  { q: "What is the primary benefit of TVET for an employer?", a: "Access to a skilled and job-ready workforce", options: ["Lower taxes", "Access to a skilled and job-ready workforce", "Increased customer base"], link: "https://www.rtb.gov.rw/employer-benefits" },
  { q: "Which of these is a practical skill taught in TVET?", a: "Electrical wiring", options: ["Public administration", "Electrical wiring", "History research"], link: "https://www.rtb.gov.rw/electrical" },
  { q: "How does TVET support sustainable development?", a: "By promoting green skills and practices", options: ["By building more roads", "By promoting green skills and practices", "By encouraging urban migration"], link: "https://www.rtb.gov.rw/sustainable-dev" },
  { q: "What is the role of a TVET counselor?", a: "To guide students on career paths", options: ["To teach academic subjects", "To guide students on career paths", "To manage school finances"], link: "https://www.rtb.gov.rw/counselor" },
  { q: "Which of these is a common TVET workshop?", a: "A carpentry workshop", options: ["A library", "A cafeteria", "A carpentry workshop"], link: "https://www.rtb.gov.rw/workshop" },
  { q: "What is the 'TVET Sector Strategic Plan'?", a: "A plan for the development of TVET", options: ["A list of all TVET schools", "A plan for the development of TVET", "A marketing plan for TVET"], link: "https://www.rtb.gov.rw/strategic-plan" },
  { q: "How does TVET help to reduce social inequality?", a: "By providing opportunities to marginalized groups", options: ["By giving everyone a job", "By providing opportunities to marginalized groups", "By building more schools in cities"], link: "https://www.rtb.gov.rw/social-inequality" },
  { q: "What is the purpose of 'On-the-Job Training'?", a: "To apply classroom knowledge in a real work environment", options: ["To find a new job", "To apply classroom knowledge in a real work environment", "To get a full-time salary"], link: "https://www.rtb.gov.rw/on-the-job" },
  { q: "Which of these is a TVET field in the service sector?", a: "Hospitality and Tourism", options: ["Agriculture", "Manufacturing", "Hospitality and Tourism"], link: "https://www.rtb.gov.rw/service-sector" },
  { q: "What is a key component of TVET assessment?", a: "Practical skills demonstration", options: ["Written exams only", "Practical skills demonstration", "Group projects only"], link: "https://www.rtb.gov.rw/assessment" }
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
  const [quizSet, setQuizSet] = useState([]);

  // Function to get 20 random questions
  const getRandomQuestions = () => {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 20);
  };
  
  const handleStartQuiz = (e) => {
    e.preventDefault();
    if (participantInfo.phone && participantInfo.name) {
      setStarted(true);
      setQuizSet(getRandomQuestions());
      setMessage("");
    } else {
      setMessage("Please enter your name and phone number to start.");
    }
  };

  const currentQuestion = quizSet[currentQuestionIndex];
  
  const handleAnswer = (selectedAnswer) => {
    if (showAnswer) return;

    if (selectedAnswer === currentQuestion.a) {
      setScore(score + 5);
      setMessage("Correct!");
    } else {
      setMessage("Wrong answer. See the correct answer and a link to learn more.");
    }
    setShowAnswer(true);

    setTimeout(() => {
      if (currentQuestionIndex < quizSet.length - 1) {
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
    setQuizSet(getRandomQuestions());
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
      <h3>Question {currentQuestionIndex + 1} of {quizSet.length}</h3>
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