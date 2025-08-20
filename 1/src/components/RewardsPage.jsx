import React from 'react';
import useUserStore from '../store/userStore';

const rewards = [
  {
    id: 'yt-premium',
    title: 'YouTube Premium (1 month)',
    cost: 500,
    image: 'https://www.youtube.com/img/desktop/yt_1200.png'
  },
  {
    id: 'udemy-course',
    title: 'Any Udemy Course',
    cost: 300,
    image: 'https://www.udemy.com/staticx/udemy/images/v7/logo-udemy.svg'
  },
  {
    id: 'spotify-premium',
    title: 'Spotify Premium (1 month)',
    cost: 400,
    image: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png'
  }
];

function RewardsPage() {
  const tokens = useUserStore((state) => state.tokens);
  const addTokens = useUserStore((state) => state.addTokens);

  const handleRedeemReward = (reward) => {
    if (tokens >= reward.cost) {
      addTokens(-reward.cost);
      alert(`Successfully redeemed ${reward.title}!`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Rewards Store</h1>
        <p className="text-xl text-gray-600">
          You have <span className="font-bold text-yellow-500">{tokens} tokens</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-white rounded-lg shadow-lg p-6">
            <img 
              src={reward.image} 
              alt={reward.title}
              className="h-32 w-full object-contain mb-4"
            />
            <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.title}</h3>
            <div className="flex items-center justify-between mt-4">
              <span className="text-yellow-500 font-bold">{reward.cost} tokens</span>
              <button
                onClick={() => handleRedeemReward(reward)}
                disabled={tokens < reward.cost}
                className={`px-4 py-2 rounded-lg ${
                  tokens >= reward.cost
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
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

export default RewardsPage;