import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface MusicianShowRecord {
  show_id: string;
  fee: number;
  confirmed: boolean | null;
  show_title: string;
  show_date: string;
  show_status: string;
  show_venue: string | null;
}

export interface MusicianStats {
  musicianId: string;
  totalShows: number;
  completedShows: number;
  cancelledShows: number;
  upcomingShows: number;
  totalEarned: number;
  showHistory: MusicianShowRecord[];
}

export function useMusicianStats() {
  const { user } = useAuth();
  const [rawData, setRawData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from("show_musicians")
          .select(`
            musician_id,
            fee,
            confirmed,
            show_id,
            shows!inner (
              title,
              date,
              status,
              venue,
              user_id
            )
          `)
          .eq("shows.user_id", user.id);

        if (error) throw error;
        setRawData(data || []);
      } catch (err) {
        console.error("Error fetching musician stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  const statsMap = useMemo(() => {
    const map: Record<string, MusicianStats> = {};

    rawData.forEach((row: any) => {
      const mid = row.musician_id;
      const show = row.shows;
      if (!show) return;

      if (!map[mid]) {
        map[mid] = {
          musicianId: mid,
          totalShows: 0,
          completedShows: 0,
          cancelledShows: 0,
          upcomingShows: 0,
          totalEarned: 0,
          showHistory: [],
        };
      }

      const stats = map[mid];
      stats.totalShows += 1;

      if (show.status === "completed") {
        stats.completedShows += 1;
        stats.totalEarned += Number(row.fee || 0);
      } else if (show.status === "cancelled") {
        stats.cancelledShows += 1;
      } else {
        stats.upcomingShows += 1;
      }

      stats.showHistory.push({
        show_id: row.show_id,
        fee: Number(row.fee || 0),
        confirmed: row.confirmed,
        show_title: show.title,
        show_date: show.date,
        show_status: show.status,
        show_venue: show.venue,
      });
    });

    // Sort history by date desc
    Object.values(map).forEach((s) => {
      s.showHistory.sort((a, b) => b.show_date.localeCompare(a.show_date));
    });

    return map;
  }, [rawData]);

  const getStats = (musicianId: string): MusicianStats =>
    statsMap[musicianId] || {
      musicianId,
      totalShows: 0,
      completedShows: 0,
      cancelledShows: 0,
      upcomingShows: 0,
      totalEarned: 0,
      showHistory: [],
    };

  return { statsMap, getStats, loading };
}
