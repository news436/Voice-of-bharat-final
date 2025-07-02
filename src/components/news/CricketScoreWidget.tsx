import { useEffect, useState, useRef } from 'react';

interface Team {
  name: string;
  shortName: string;
  flag: string;
}

interface Match {
  id: string;
  team1: Team;
  team2: Team;
  score1: string;
  score2: string;
  overs1: string;
  overs2: string;
  status: string;
  matchTitle: string;
  venue: string;
  date: string;
  time: string;
  result?: string;
  isLive: boolean;
  isInternational: boolean;
  isRecent?: boolean;
  isUpcoming?: boolean;
}

const RAPIDAPI_KEY = '87a6cd20bcmsh59e05c5540d3ce2p1d0111jsna03a9afd7447';
const RAPIDAPI_HOST = 'cricbuzz-cricket.p.rapidapi.com';

function parseMatches(data: any, type: 'live' | 'recent' | 'upcoming'): Match[] {
  const matches: Match[] = [];
  if (!data.typeMatches) return matches;
  for (const typeMatch of data.typeMatches) {
    if (!typeMatch.matchType || !typeMatch.matchType.toLowerCase().includes('international')) continue;
    for (const seriesMatch of typeMatch.seriesMatches || []) {
      const series = seriesMatch.seriesAdWrapper;
      const seriesName = series?.seriesName || '';
      for (const m of series?.matches || []) {
        const info = m.matchInfo;
        if (!info) continue;
        // Only show live/recent/upcoming as needed
        if (type === 'live' && (!info.state || !info.state.toLowerCase().includes('in progress'))) continue;
        if (type === 'recent' && (!info.state || info.state.toLowerCase().includes('in progress') || !['complete', 'result', 'stumps'].some(s => info.state.toLowerCase().includes(s)))) continue;
        if (type === 'upcoming' && (!info.state || info.state.toLowerCase().includes('in progress') || ['complete', 'result', 'stumps'].some(s => info.state.toLowerCase().includes(s)))) continue;
        const team1 = info.team1 || {};
        const team2 = info.team2 || {};
        // Score extraction from matchScore
        let score1 = '-';
        let overs1 = '';
        let score2 = '-';
        let overs2 = '';
        if (m.matchScore) {
          const t1s = m.matchScore.team1Score?.inngs1;
          if (t1s) {
            score1 = `${t1s.runs ?? '-'}${typeof t1s.wickets !== 'undefined' ? '/' + t1s.wickets : ''}`;
            overs1 = t1s.overs ? `(${t1s.overs})` : '';
          }
          const t2s = m.matchScore.team2Score?.inngs1;
          if (t2s) {
            score2 = `${t2s.runs ?? '-'}${typeof t2s.wickets !== 'undefined' ? '/' + t2s.wickets : ''}`;
            overs2 = t2s.overs ? `(${t2s.overs})` : '';
          }
        }
        matches.push({
          id: info.matchId,
          team1: {
            name: team1.teamName || '',
            shortName: team1.teamSName || '',
            flag: '', // No image
          },
          team2: {
            name: team2.teamName || '',
            shortName: team2.teamSName || '',
            flag: '', // No image
          },
          score1,
          score2,
          overs1,
          overs2,
          status: info.state || '',
          matchTitle: `${seriesName} - ${info.matchDesc || ''}`,
          venue: info.venueInfo?.ground || '',
          date: info.startDate ? new Date(Number(info.startDate)).toLocaleDateString() : '',
          time: info.startDate ? new Date(Number(info.startDate)).toLocaleTimeString() : '',
          result: info.status || '',
          isLive: type === 'live',
          isInternational: true,
          isRecent: type === 'recent',
          isUpcoming: type === 'upcoming',
        });
      }
    }
  }
  return matches;
}

export const CricketScoreWidget = () => {
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch live/recent/upcoming matches
        const res = await fetch('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live', {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
        });
        const data = await res.json();
        const liveMatches = parseMatches(data, 'live');
        const recentMatches = parseMatches(data, 'recent');
        // Fetch upcoming
        const resUpcoming = await fetch('https://cricbuzz-cricket.p.rapidapi.com/matches/v1/upcoming', {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          },
        });
        const dataUpcoming = await resUpcoming.json();
        const upcomingMatches = parseMatches(dataUpcoming, 'upcoming');
        // Concatenate all matches: live → recent → upcoming
        setAllMatches([...liveMatches, ...recentMatches, ...upcomingMatches]);
        setCurrent(0); // Reset slider to first match
      } catch (err) {
        setError('Failed to fetch cricket matches.');
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
    const interval = setInterval(fetchScores, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Auto-slider logic
  useEffect(() => {
    if (allMatches.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % allMatches.length);
    }, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [allMatches.length]);

  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-lg p-4 w-full max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <img src="https://www.cricbuzz.com/images/cb_logo.svg" alt="ICC" className="h-6 w-6" loading="lazy" />
        Cricket International Matches
      </h3>
      {loading && <div className="text-center py-8 text-gray-500">Loading...</div>}
      {error && <div className="text-center py-8 text-red-500">{error}</div>}
      {!loading && !error && allMatches.length === 0 && (
        <div className="text-center py-8 text-gray-500">No international matches found.</div>
      )}
      <div className="flex flex-col items-center">
        {allMatches.length > 0 && (
          <>
            <MatchCard match={allMatches[current]} />
            <div className="flex items-center justify-center gap-2 mt-4">
              {allMatches.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrent(idx)}
                  className={`transition-all duration-300 rounded-full ${idx === current ? 'w-6 h-3 bg-red-600 opacity-100' : 'w-3 h-3 bg-red-400 opacity-50'} focus:outline-none`}
                  aria-label={`Go to match ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="text-right mt-4">
        <a href="https://www.cricbuzz.com/cricket-match/live-scores" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium">See more ICC</a>
      </div>
    </div>
  );
};

function MatchCard({ match }: { match: Match }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 shadow flex flex-col gap-2 mb-4 w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-black dark:text-white">{match.team1.shortName}</span>
        </div>
        <div className="text-xl font-bold text-black dark:text-white">{match.score1} <span className="text-xs font-normal">{match.overs1}</span></div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-black dark:text-white">{match.team2.shortName}</span>
        </div>
        <div className="text-xl font-bold text-black dark:text-white">{match.score2} <span className="text-xs font-normal">{match.overs2}</span></div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        {match.isLive && <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">LIVE</span>}
        {match.isRecent && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded">RECENT</span>}
        {match.isUpcoming && <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded">UPCOMING</span>}
        <span className="text-xs text-gray-700 dark:text-gray-300">{match.result}</span>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {match.matchTitle} &middot; {match.venue}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        {match.date} {match.time}
      </div>
    </div>
  );
} 