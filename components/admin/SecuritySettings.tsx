'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, Trash2, AlertTriangle } from 'lucide-react';

interface BannedIP {
  ip: string;
  bannedUntil: number;
  attempts: number;
}

export default function SecuritySettings() {
  const [bannedIPs, setBannedIPs] = useState<BannedIP[]>([]);
  const [loading, setLoading] = useState(true);
  const [unbanning, setUnbanning] = useState<string | null>(null);

  useEffect(() => {
    fetchBannedIPs();
  }, []);

  const fetchBannedIPs = async () => {
    try {
      const response = await fetch('/api/admin/banned-ips');
      const data = await response.json();
      setBannedIPs(data.bannedIPs || []);
    } catch (error) {
      console.error('Error fetching banned IPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const unbanIP = async (ip: string) => {
    setUnbanning(ip);
    try {
      const response = await fetch('/api/admin/banned-ips', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ip }),
      });

      if (response.ok) {
        // Refresh the list
        await fetchBannedIPs();
      } else {
        console.error('Failed to unban IP');
      }
    } catch (error) {
      console.error('Error unbanning IP:', error);
    } finally {
      setUnbanning(null);
    }
  };

  const formatTimeRemaining = (bannedUntil: number) => {
    const now = Date.now();
    const remaining = bannedUntil - now;
    
    if (remaining <= 0) return 'Expired';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    // If ban is longer than 300 days, consider it permanent
    if (days > 300) {
      return 'Permanent';
    }
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-red-600" />
          <h2 className="text-lg font-semibold">IP Security Management</h2>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Permanent IP Banning</h3>
              <p className="text-sm text-red-700 mt-1">
                IPs are <strong>permanently banned</strong> after just <strong>1 unauthorized admin access attempt</strong>.
                This provides maximum security against unauthorized access and attack attempts.
              </p>
            </div>
          </div>
        </div>

        {bannedIPs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No IPs are currently banned</p>
            <p className="text-sm">This is good - it means no unauthorized access attempts have been detected.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900 mb-3">
              Currently Banned IPs ({bannedIPs.length})
            </h3>
            
            {bannedIPs.map((ban) => (
              <div
                key={ban.ip}
                className="flex items-center justify-between p-4 border rounded-lg bg-red-50 border-red-200"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <code className="font-mono text-sm bg-red-100 px-2 py-1 rounded">
                      {ban.ip}
                    </code>
                    <span className="text-sm text-red-600">
                      {ban.attempts} failed attempts
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTimeRemaining(ban.bannedUntil) === 'Permanent' ? (
                        <span className="text-red-600 font-medium">Permanent Ban</span>
                      ) : (
                        <>Ban expires in {formatTimeRemaining(ban.bannedUntil)}</>
                      )}
                    </span>
                    {formatTimeRemaining(ban.bannedUntil) !== 'Permanent' && (
                      <span className="text-gray-400">
                        ({new Date(ban.bannedUntil).toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => unbanIP(ban.ip)}
                  disabled={unbanning === ban.ip}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {unbanning === ban.ip ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Unban
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
