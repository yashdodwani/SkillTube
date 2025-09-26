function FAQ() {
  const questions = [
    "What is QuickLearnAI?",
    "What is the difference between Meta Types and Meta Pro Plans?",
    "Is QuickLearnAI free to use?",
    "Do I need ChatGPT or Claude or Llama account?",
    "Which search engine is supported by QuickLearnAI?",
    "How do I use QuickLearnAI in my Browser?",
    "How do I keep a track of my free queries?",
    "Why cards is not opening after installation?"
  ]

  return (
    <div className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-12">Want to know more?</h2>
        <div className="bg-white/10 rounded-lg p-6">
          {questions.map((question, index) => (
            <div
              key={index}
              className="py-3 px-4 hover:bg-white/5 rounded-lg cursor-pointer transition-colors"
            >
              {question}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ