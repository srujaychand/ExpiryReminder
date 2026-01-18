
import React from 'react';
import { ExpiryStatus } from '../types';
import { STATUS_COLORS } from '../constants.tsx';

interface StatusBadgeProps {
  status: ExpiryStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
