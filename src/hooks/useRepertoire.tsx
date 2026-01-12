import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface Song {
  id: string;
  title: string;
  artist: string;
  key: string;
  duration: string;
  isMain: boolean;
  checked: boolean;
  keyOk: boolean;
  chordsReviewed: boolean;
  sortOrder: number;
}

export interface Block {
  id: string;
  name: string;
  climate: "animado" | "medio" | "calmo";
  objective: "segurar" | "levantar" | "finalizar" | "transicao";
  duration: string;
  songs: Song[];
  sortOrder: number;
}

export function useRepertoire() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchBlocks = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch blocks
      const { data: blocksData, error: blocksError } = await supabase
        .from("repertoire_blocks")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (blocksError) throw blocksError;

      // Fetch all songs for user
      const { data: songsData, error: songsError } = await supabase
        .from("repertoire_songs")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (songsError) throw songsError;

      // Map blocks with their songs
      const blocksWithSongs: Block[] = (blocksData || []).map((block) => ({
        id: block.id,
        name: block.name,
        climate: block.climate as Block["climate"],
        objective: block.objective as Block["objective"],
        duration: block.duration,
        sortOrder: block.sort_order,
        songs: (songsData || [])
          .filter((song) => song.block_id === block.id)
          .map((song) => ({
            id: song.id,
            title: song.title,
            artist: song.artist || "",
            key: song.song_key || "",
            duration: song.duration || "",
            isMain: song.is_main,
            checked: song.checked,
            keyOk: song.key_ok,
            chordsReviewed: song.chords_reviewed,
            sortOrder: song.sort_order,
          })),
      }));

      setBlocks(blocksWithSongs);
    } catch (error) {
      console.error("Error fetching repertoire:", error);
      toast.error("Erro ao carregar repertório");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlocks();
  }, [user]);

  const addBlock = async (
    name: string,
    climate: Block["climate"],
    objective: Block["objective"],
    duration: string
  ) => {
    if (!user) return null;

    try {
      const maxOrder = blocks.length > 0 ? Math.max(...blocks.map((b) => b.sortOrder)) + 1 : 0;

      const { data, error } = await supabase
        .from("repertoire_blocks")
        .insert({
          user_id: user.id,
          name,
          climate,
          objective,
          duration,
          sort_order: maxOrder,
        })
        .select()
        .single();

      if (error) throw error;

      const newBlock: Block = {
        id: data.id,
        name: data.name,
        climate: data.climate as Block["climate"],
        objective: data.objective as Block["objective"],
        duration: data.duration,
        sortOrder: data.sort_order,
        songs: [],
      };

      setBlocks([...blocks, newBlock]);
      toast.success("Bloco criado com sucesso!");
      return newBlock;
    } catch (error) {
      console.error("Error adding block:", error);
      toast.error("Erro ao criar bloco");
      return null;
    }
  };

  const updateBlock = async (
    blockId: string,
    name: string,
    climate: Block["climate"],
    objective: Block["objective"],
    duration: string
  ) => {
    try {
      const { error } = await supabase
        .from("repertoire_blocks")
        .update({ name, climate, objective, duration })
        .eq("id", blockId);

      if (error) throw error;

      setBlocks(
        blocks.map((b) =>
          b.id === blockId ? { ...b, name, climate, objective, duration } : b
        )
      );
      toast.success("Bloco atualizado!");
    } catch (error) {
      console.error("Error updating block:", error);
      toast.error("Erro ao atualizar bloco");
    }
  };

  const deleteBlock = async (blockId: string) => {
    try {
      const { error } = await supabase
        .from("repertoire_blocks")
        .delete()
        .eq("id", blockId);

      if (error) throw error;

      setBlocks(blocks.filter((b) => b.id !== blockId));
      toast.success("Bloco excluído!");
    } catch (error) {
      console.error("Error deleting block:", error);
      toast.error("Erro ao excluir bloco");
    }
  };

  const reorderBlocks = async (newBlocks: Block[]) => {
    try {
      // Update local state immediately
      setBlocks(newBlocks);

      // Update sort_order in database
      const updates = newBlocks.map((block, index) => ({
        id: block.id,
        sort_order: index,
      }));

      for (const update of updates) {
        await supabase
          .from("repertoire_blocks")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);
      }
    } catch (error) {
      console.error("Error reordering blocks:", error);
      toast.error("Erro ao reordenar blocos");
      fetchBlocks(); // Revert to database state
    }
  };

  const addSong = async (
    blockId: string,
    title: string,
    artist: string,
    key: string,
    duration: string
  ) => {
    if (!user) return null;

    try {
      const block = blocks.find((b) => b.id === blockId);
      const maxOrder = block && block.songs.length > 0 
        ? Math.max(...block.songs.map((s) => s.sortOrder)) + 1 
        : 0;

      const { data, error } = await supabase
        .from("repertoire_songs")
        .insert({
          block_id: blockId,
          user_id: user.id,
          title,
          artist,
          song_key: key,
          duration,
          sort_order: maxOrder,
        })
        .select()
        .single();

      if (error) throw error;

      const newSong: Song = {
        id: data.id,
        title: data.title,
        artist: data.artist || "",
        key: data.song_key || "",
        duration: data.duration || "",
        isMain: data.is_main,
        checked: data.checked,
        keyOk: data.key_ok,
        chordsReviewed: data.chords_reviewed,
        sortOrder: data.sort_order,
      };

      setBlocks(
        blocks.map((b) =>
          b.id === blockId ? { ...b, songs: [...b.songs, newSong] } : b
        )
      );
      toast.success("Música adicionada!");
      return newSong;
    } catch (error) {
      console.error("Error adding song:", error);
      toast.error("Erro ao adicionar música");
      return null;
    }
  };

  const updateSong = async (
    blockId: string,
    songId: string,
    updates: Partial<{
      isMain: boolean;
      checked: boolean;
      keyOk: boolean;
      chordsReviewed: boolean;
    }>
  ) => {
    try {
      const dbUpdates: Record<string, boolean> = {};
      if (updates.isMain !== undefined) dbUpdates.is_main = updates.isMain;
      if (updates.checked !== undefined) dbUpdates.checked = updates.checked;
      if (updates.keyOk !== undefined) dbUpdates.key_ok = updates.keyOk;
      if (updates.chordsReviewed !== undefined) dbUpdates.chords_reviewed = updates.chordsReviewed;

      const { error } = await supabase
        .from("repertoire_songs")
        .update(dbUpdates)
        .eq("id", songId);

      if (error) throw error;

      setBlocks(
        blocks.map((b) =>
          b.id === blockId
            ? {
                ...b,
                songs: b.songs.map((s) =>
                  s.id === songId ? { ...s, ...updates } : s
                ),
              }
            : b
        )
      );
    } catch (error) {
      console.error("Error updating song:", error);
      toast.error("Erro ao atualizar música");
    }
  };

  const setMainSong = async (blockId: string, songId: string) => {
    try {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      // Reset all songs in block to not main
      for (const song of block.songs) {
        if (song.isMain && song.id !== songId) {
          await supabase
            .from("repertoire_songs")
            .update({ is_main: false })
            .eq("id", song.id);
        }
      }

      // Set new main song
      await supabase
        .from("repertoire_songs")
        .update({ is_main: true })
        .eq("id", songId);

      setBlocks(
        blocks.map((b) =>
          b.id === blockId
            ? {
                ...b,
                songs: b.songs.map((s) => ({
                  ...s,
                  isMain: s.id === songId,
                })),
              }
            : b
        )
      );
    } catch (error) {
      console.error("Error setting main song:", error);
      toast.error("Erro ao definir música principal");
    }
  };

  const deleteSong = async (blockId: string, songId: string) => {
    try {
      const { error } = await supabase
        .from("repertoire_songs")
        .delete()
        .eq("id", songId);

      if (error) throw error;

      setBlocks(
        blocks.map((b) =>
          b.id === blockId
            ? { ...b, songs: b.songs.filter((s) => s.id !== songId) }
            : b
        )
      );
      toast.success("Música removida!");
    } catch (error) {
      console.error("Error deleting song:", error);
      toast.error("Erro ao remover música");
    }
  };

  return {
    blocks,
    loading,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    addSong,
    updateSong,
    setMainSong,
    deleteSong,
    refetch: fetchBlocks,
  };
}
