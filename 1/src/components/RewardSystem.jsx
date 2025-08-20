import React from 'react';
import useUserStore from '../store/userStore';

function RewardSystem() {
  const tokens = useUserStore((state) => state.tokens);

  const rewards = [
    {
      id: 'certificate',
      title: 'Course Completion Certificate',
      cost: 100,
      description: 'Get a verified certificate for your completed course',
      icon: '🎓'
    },
    {
      id: 'premium',
      title: 'Premium Course Access',
      cost: 200,
      description: 'Unlock access to premium course content',
      icon: '⭐'
    },
    {
      id: 'mentor',
      title: 'Mentor Session',
      cost: 300,
      description: '30-minute one-on-one session with a course mentor',
      icon: '👨‍🏫'
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reward System</h1>
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg flex items-center">
          <span className="mr-2">🏆</span>
          <span className="font-medium">{tokens} Tokens Available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-4">{reward.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.title}</h3>
            <p className="text-gray-600 mb-4">{reward.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-yellow-600 font-bold">{reward.cost} Tokens</span>
              <button
                className={`px-4 py-2 rounded-lg ${
                  tokens >= reward.cost
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                disabled={tokens < reward.cost}
              >
                Redeem
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RewardSystem;