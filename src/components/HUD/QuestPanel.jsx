import React, { useState } from 'react';
import useQuestStore from '../../stores/useQuestStore';
import useRankedStore from '../../stores/useRankedStore';

export default function QuestPanel({ onClose }) {
  const quests = useQuestStore((s) => s.quests);
  const claimReward = useQuestStore((s) => s.claimReward);
  const totalQuestsCompleted = useQuestStore((s) => s.totalQuestsCompleted);
  const totalRewardsEarned = useQuestStore((s) => s.totalRewardsEarned);

  const handleClaim = (questId) => {
    const reward = claimReward(questId);
    if (reward > 0) {
      // Add reward to ranked points
      const rankedStore = useRankedStore.getState();
      const currentPoints = rankedStore.points;
      // Directly add bonus points
      useRankedStore.setState({
        points: currentPoints + reward,
        highestPoints: Math.max(rankedStore.highestPoints, currentPoints + reward),
      });
      // Persist
      try {
        const data = JSON.parse(localStorage.getItem('cardBattle_ranked') || '{}');
        data.points = currentPoints + reward;
        data.highestPoints = Math.max(data.highestPoints || 0, currentPoints + reward);
        localStorage.setItem('cardBattle_ranked', JSON.stringify(data));
      } catch (e) {}
    }
  };

  return (
    <div className="quest-panel">
      <div className="quest-panel__header">
        <h2 className="quest-panel__title">📋 Daily Quests</h2>
        <button className="quest-panel__close" onClick={onClose}>✕</button>
      </div>

      <div className="quest-panel__stats">
        <span>✅ Total selesai: {totalQuestsCompleted}</span>
        <span>💰 Total reward: {totalRewardsEarned} RP</span>
      </div>

      <div className="quest-panel__list">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className={`quest-item ${quest.completed ? 'quest-item--completed' : ''} ${quest.claimed ? 'quest-item--claimed' : ''}`}
          >
            <div className="quest-item__icon">{quest.icon}</div>
            <div className="quest-item__info">
              <div className="quest-item__title">{quest.title}</div>
              <div className="quest-item__desc">{quest.description}</div>
              <div className="quest-item__progress-bar">
                <div
                  className="quest-item__progress-fill"
                  style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                />
              </div>
              <div className="quest-item__progress-text">
                {quest.progress}/{quest.target}
              </div>
            </div>
            <div className="quest-item__reward">
              {quest.claimed ? (
                <span className="quest-item__claimed-label">✅</span>
              ) : quest.completed ? (
                <button className="quest-item__claim-btn" onClick={() => handleClaim(quest.id)}>
                  +{quest.reward} RP
                </button>
              ) : (
                <span className="quest-item__reward-label">🏅 {quest.reward}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
