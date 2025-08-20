import Image1 from '../assets/1.png'
import Image2 from '../assets/2.png'
import Image3 from '../assets/3.png'
import Image4 from '../assets/4.png'

function Features() {
  const features = [
    {
      title: "One-click answers in realtime",
      description: "Don't waste time. Just ask, search, rearrange and create content out of any website you visit.",
      image: Image1
    },
    {
      title: "Search better and get answers in a glance",
      description: "Avoid spending time going through each search result. Get an AI-generated summary and ask for specific details.",
      image: Image2
    },
    {
      title: "Add content with anything",
      description: "Writing a contract or making a quiz? Just upload guidebooks or lecture PDFs, let QuickLearn learn them and respond.",
      image: Image3
    },
    {
      title: "Learn smart, not in a rush",
      description: "Spend time actively learning using video summaries and chat with the video, instead of rushing videos on 2x.",
      image: Image4
    }
  ]

  return (
    <div className="py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {features.map((feature, index) => (
            <div key={index} className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4">
                <img src={feature.image} alt={feature.title} className="w-full rounded-lg" />
              </div>
              <h3 className="text-2xl font-bold">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Features