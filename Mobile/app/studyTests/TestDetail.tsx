import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QuizHeader from '@/components/headers/header';
import { useTheme } from '@/theme/global';
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/config';

type Choice = { choiceId?: number; text?: string; order?: number; isCorrect?: boolean };
type EvalQuestion = { questionId?: number; text?: string; choices?: Choice[] };
type Evaluation = {
  id: number;
  type?: string;
  courseCode?: string;
  courseName?: string;
  questions?: EvalQuestion[];
};

function pickArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

export default function TestDetail() {
  const { typography, colors } = useTheme();
  const { evaluationId } = useLocalSearchParams<{ evaluationId?: string }>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const fetchOne = useCallback(async () => {
    if (!evaluationId) return;
    setLoading(true);
    setError(null);
    try {
      const raw = pickArray(await api.get<any>(ENDPOINTS.evaluations.revision));
      const normalized: Evaluation[] = raw.map((e: any, idx: number) => ({
        id: Number(e?.id ?? e?.evaluationId ?? idx),
        type: e?.type,
        courseCode: e?.courseCode,
        courseName: e?.courseName,
        questions: Array.isArray(e?.questions) ? e.questions : [],
      }));
      const found = normalized.find((e) => String(e.id) === String(evaluationId));
      if (!mountedRef.current) return;
      setEvaluation(found || null);
    } catch (e: any) {
      if (!mountedRef.current) return;
      setError(e?.message || 'Failed to load evaluation');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [evaluationId]);

  useEffect(() => {
    fetchOne();
  }, [fetchOne]);

  const questions = useMemo(() => {
    const list = evaluation?.questions || [];
    return list
      .map((q: any, idx: number) => ({
        id: Number(q?.questionId ?? idx),
        text: String(q?.text ?? 'Question'),
        choices: Array.isArray(q?.choices)
          ? [...q.choices].sort((a: any, b: any) => Number(a?.order || 0) - Number(b?.order || 0))
          : [],
      }))
      .filter((q: any) => Number.isFinite(q.id));
  }, [evaluation]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <QuizHeader />
      <Text style={[styles.title, { fontFamily: typography.fontFamily.heading }]}>
        {evaluation
          ? `${evaluation.type || 'Evaluation'} — ${[evaluation.courseCode || '', evaluation.courseName || ''].filter(Boolean).join(' — ')}`
          : 'Past Test'}
      </Text>

      {loading ? (
        <View style={{ alignItems: 'center', padding: 24 }}>
          <ActivityIndicator size="large" color="#4B1F3B" />
          <Text style={{ marginTop: 8 }}>Loading…</Text>
        </View>
      ) : error ? (
        <View style={{ alignItems: 'center', padding: 24 }}>
          <Text style={{ color: '#b00020', marginBottom: 12 }}>{error}</Text>
          <TouchableOpacity style={[styles.navBtn, styles.primaryBtn]} onPress={fetchOne}>
            <Text style={styles.primaryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : !evaluation ? (
        <View style={{ alignItems: 'center', padding: 24 }}>
          <Text>No evaluation found.</Text>
          <TouchableOpacity style={[styles.navBtn, styles.secondaryBtn]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color="#331424" />
            <Text style={styles.secondaryBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(q) => String(q.id)}
          contentContainerStyle={{ paddingBottom: 24 }}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.question}>{`Q${index + 1}. ${item.text}`}</Text>
              {(item.choices || []).map((c: Choice, i: number) => {
                const correct = !!c?.isCorrect;
                return (
                  <View
                    key={String(c?.choiceId ?? i)}
                    style={[styles.option, correct ? styles.correct : undefined]}
                  >
                    <Text style={styles.optionText}>
                      {String.fromCharCode(65 + i)}. {c?.text || ''}
                      {correct ? '  (Correct)' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        />
      )}

      <View style={[styles.navRow, { marginBottom: 16 }]}>
        <TouchableOpacity style={[styles.navBtn, styles.secondaryBtn]} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={18} color="#331424" />
          <Text style={styles.secondaryBtnText}>Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: '700', margin: 15, color: '#331424' },
  card: { backgroundColor: '#fff', padding: 18, borderRadius: 14, marginHorizontal: 15, marginTop: 15, elevation: 3 },
  question: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  option: { padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginBottom: 8 },
  correct: { backgroundColor: '#D4F8E8', borderColor: '#1abc2dff' },
  optionText: { fontWeight: '600' },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 15, marginTop: 15 },
  navBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, minWidth: 120, elevation: 3 },
  primaryBtn: { backgroundColor: '#FD2A9B' },
  secondaryBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#331424' },
  primaryBtnText: { color: '#fff', fontWeight: '700', marginHorizontal: 6 },
  secondaryBtnText: { color: '#331424', fontWeight: '700', marginHorizontal: 6 },
});
