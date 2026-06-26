'use client';

import { useTransition } from 'react';
import { updateRequestStatus } from './actions';
import { useRouter } from 'next/navigation';

export default function StatusUpdater({ requestId, currentStatus }: { requestId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(() => {
      updateRequestStatus(requestId, newStatus);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-gray-400">Status:</label>
      <select 
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className="bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-1.5 text-sm font-medium text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
      >
        <option value="PENDING">Pending</option>
        <option value="REVIEWING">Reviewing</option>
        <option value="QUOTED">Quoted</option>
        <option value="CONVERTED">Converted (Job)</option>
        <option value="REJECTED">Rejected</option>
      </select>
      {isPending && <span className="text-xs text-purple-400 animate-pulse">Updating...</span>}
    </div>
  );
}
