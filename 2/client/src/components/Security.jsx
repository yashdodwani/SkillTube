import React from 'react';

function Security() {
  return (
    <div className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-16">
          <h2 className="text-6xl font-serif mb-6">
            Secure and customizable
          </h2>
          <p className="text-gray-400 text-xl max-w-3xl">
            Build custom solutions that adapt to your context, knowledge or brand voice,
            with industry-leading security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Security Card */}
          <div className="bg-[#11B981] p-8 rounded-2xl h-[400px] flex flex-col">
            <div className="bg-black/20 rounded-xl p-6 mb-8 h-48 flex items-center">
              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="bg-black rounded-lg p-4 flex items-center justify-center text-center">
                  <div className="text-sm font-bold leading-tight">
                    SOC 2<br />TYPE II
                  </div>
                </div>
                <div className="bg-black rounded-lg p-4 flex items-center justify-center text-center">
                  <div className="text-sm font-bold">GDPR</div>
                </div>
                <div className="bg-black rounded-lg p-4 flex items-center justify-center text-center">
                  <div className="text-sm font-bold leading-tight">
                    ISO<br />27001
                  </div>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-serif mb-4 text-[#F4F4F4]">Industry-grade data security</h3>
            <p className="text-black">
              GDPR, ISO 27001, AICPA SOC 2 certification for industry-standard data security.
            </p>
          </div>

          {/* Prompt Library Card */}
          <div className="bg-[#11B981] p-8 rounded-2xl h-[400px] flex flex-col">
            <div className="bg-black/20 rounded-xl p-6 mb-8 h-48">
              <div className="bg-black rounded-lg p-4 h-full flex flex-col justify-center space-y-4">
                <p className="text-sm">    Compose a professional email</p>
                <p className="text-sm"> Generate a personalized daily</p>
              </div>
            </div>
            <h3 className="text-2xl font-serif mb-4 text-[#F4F4F4]">Make your own prompt library</h3>
            <p className="text-black">
              Automate generation of text, comments and posts with one click.
            </p>
          </div>

          {/* Chatbot Card */}
          <div className="bg-[#11B981] p-8 rounded-2xl h-[400px] flex flex-col">
            <div className="bg-black/20 rounded-xl p-6 mb-8 h-48">
              <div className="bg-black rounded-lg p-4 h-full flex flex-col justify-between">
                <div>
                  <div className="text-sm mb-2">System</div>
                  <div className="text-sm bg-zinc-800 rounded p-2">You are a custom nutrition expert</div>
                </div>
                <div>
                  <div className="text-sm mb-2">Assistant</div>
                  <div className="text-sm bg-zinc-800 rounded p-2">Here is an example response</div>
                </div>
              </div>
            </div>
            <h3 className="text-2xl font-serif mb-4 text-[#F4F4F4]">Create custom bots</h3>
            <p className="text-black">
              String instructions, context and knowledge together to create custom chatbots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Security;