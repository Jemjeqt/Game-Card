import React from 'react';
import useQuestStore from '../../stores/useQuestStore';

export default function QuestNotification() {
  const notification = useQuestStore((s) => s.questNotification);

  if (!notification) return null;

  return (
    <div className="quest-notification">
      <div className="quest-notification__content">
        <span className="quest-notification__icon">{notification.icon}</span>
        <div className="quest-notification__text">
          <span className="quest-notification__label">Quest Selesai!</span>
          <span className="quest-notification__title">{notification.title}</span>
        </div>
        <span className="quest-notification__reward">+{notification.reward}</span>
      </div>
    </div>
  );
}
