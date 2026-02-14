import { useNavigate } from 'react-router';
import * as api from '../api';
import { useEffect } from 'react';

export default function CurrentCycle() {
  const navigate = useNavigate();

  useEffect(() => {
    api.fetchCycles().then((cycles) => {
      if (cycles.length === 0) {
        navigate('/?newCycle=1', { replace: true });
        return;
      }

      const latestCycle = cycles[cycles.length - 1];
      navigate(`/cycle/${latestCycle.id}`, { replace: true });
    }).catch(() => {
      navigate('/');
    });
  }, [navigate]);

  return null;
}
