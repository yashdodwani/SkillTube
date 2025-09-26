import SearchBar from "./SearchBar"
import { motion } from "framer-motion"

function Hero() {
  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-[#00FF9D]/20 to-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-l from-[#00FF9D]/20 to-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-1 mb-8"
        >
          <span className="h-2 w-2 bg-secondary rounded-full"></span>
          <span className="text-sm">Powered by AI/OCR engine</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-6xl font-bold mb-6 relative"
        >
          Summarising your
          <br />
          content with{" "}
          <span className="relative">
            AI
            <motion.div 
              className="absolute -bottom-2 left-0 w-full h-1 bg-[#00FF9D]"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 1 }}
            />
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-gray-400 text-xl mb-12 max-w-2xl mx-auto"
        >
          An open source content management system that uses AI to automate
          various aspects of content creation, optimization, and distribution.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="relative max-w-2xl mx-auto"
        >
          <SearchBar />
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="grid grid-cols-3 gap-8 mt-20 max-w-3xl mx-auto"
        >
          <div className="text-center">
            <h3 className="text-4xl font-bold text-[#00FF9D]">10K+</h3>
            <p className="text-gray-400 mt-2">Active Users</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold text-[#00FF9D]">50K+</h3>
            <p className="text-gray-400 mt-2">Documents Processed</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold text-[#00FF9D]">99%</h3>
            <p className="text-gray-400 mt-2">Accuracy Rate</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Hero