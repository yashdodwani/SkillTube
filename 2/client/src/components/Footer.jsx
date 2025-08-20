function Footer() {
  const links = {
    Productivity: [
      "AI for Design",
      "AI for Twitter",
      "AI for LinkedIn",
      "Supercharger for Twitter",
      "Text to Image - Midjourney",
      "Quizzes AI",
      "Summarize AI"
    ],
    AI: [
      "Chat with Notion",
      "Free GPT-4s",
      "Chat with web articles",
      "Chat with PDF",
      "Chat with Website",
      "AI API",
      "AI SDK"
    ],
    Company: [
      "Product",
      "Blog",
      "Change Product",
      "Track events",
      "Feature Request"
    ]
  }

  return (
    <footer className="bg-black/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-xl font-bold mb-4">QuickLearnAI</h3>
            <p className="text-gray-400 mb-6">
              All-in-One AI solution to Write, Summarize, Code & Play
            </p>
            <button className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent/80">
              Connect AI
            </button>
            <div className="flex space-x-4 mt-6">
              <div className="w-8 h-8 bg-white/10 rounded-full"></div>
              <div className="w-8 h-8 bg-white/10 rounded-full"></div>
              <div className="w-8 h-8 bg-white/10 rounded-full"></div>
              <div className="w-8 h-8 bg-white/10 rounded-full"></div>
            </div>
          </div>
          
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-bold mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={index}>
                    <a href="#" className="text-gray-400 hover:text-white">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer