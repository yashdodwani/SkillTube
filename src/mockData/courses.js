export const mockCourses = [
  {
    id: 'mock-1',
    title: 'Introduction to React',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '45 minutes',
    difficulty: 'medium',
    chunks: [
      {
        title: 'React Basics',
        summary: 'Learn the fundamentals of React including components and props.',
        start_time: 0,
        end_time: 180,
        questions: [
          {
            question: 'What is a React component?',
            options: [
              'A reusable piece of UI',
              'A database table',
              'A CSS file',
              'A JavaScript variable'
            ],
            correct_answer: 0,
            explanation: 'React components are reusable pieces of UI that can contain logic and presentation.'
          }
        ]
      },
      {
        title: 'State Management',
        summary: 'Understanding state and how to manage it in React applications.',
        start_time: 181,
        end_time: 360,
        questions: [
          {
            question: 'What hook is used for state in React?',
            options: [
              'useEffect',
              'useState',
              'useReducer',
              'useContext'
            ],
            correct_answer: 1,
            explanation: 'useState is the primary hook for managing state in React components.'
          }
        ]
      }
    ]
  },
  {
    id: 'mock-2',
    title: 'Advanced JavaScript Concepts',
    thumbnail: 'https://img.youtube.com/vi/xCGv9_tAXR8/maxresdefault.jpg',
    duration: '60 minutes',
    difficulty: 'hard',
    chunks: [
      {
        title: 'Closures',
        summary: 'Deep dive into JavaScript closures and their practical applications.',
        start_time: 0,
        end_time: 240,
        questions: [
          {
            question: 'What is a closure?',
            options: [
              'A function with access to its outer scope',
              'A way to close browser windows',
              'A type of loop',
              'A JavaScript module'
            ],
            correct_answer: 0,
            explanation: 'A closure is a function that has access to variables in its outer (enclosing) scope.'
          }
        ]
      }
    ]
  }
];