import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getStats } from '../database';
import { Colors, Radius, Shadow } from '../theme';

function CarteChiffre({ iconName, valeur, label, couleur }) {
  return (
    <View style={[styles.carteChiffre, { borderLeftColor: couleur }]}>
      <Ionicons name={iconName} size={26} color={couleur} style={{ marginBottom: 6 }} />
      <Text style={[styles.carteValeur, { color: couleur }]}>{valeur}</Text>
      <Text style={styles.carteLabel}>{label}</Text>
    </View>
  );
}

function EtoilesNote({ note }) {
  const arrondi = Math.round(note);
  return (
    <View style={{ flexDirection: 'row', gap: 4, marginTop: 6 }}>
      {[1,2,3,4,5].map(i => (
        <Ionicons key={i} name={i <= arrondi ? 'star' : 'star-outline'}
          size={28} color={i <= arrondi ? Colors.gold : Colors.border} />
      ))}
    </View>
  );
}

export default function StatsScreen() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => { chargerStats(); }, [])
  );

  async function chargerStats() {
    setLoading(true);
    try {
      const data = await getStats();
      setStats(data);
    } catch (e) {
      console.error('chargerStats:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <View style={styles.centré}><ActivityIndicator size="large" color={Colors.primary} /></View>;
  }

  if (!stats || stats.total === 0) {
    return (
      <View style={styles.centré}>
        <Ionicons name="library-outline" size={64} color={Colors.border} />
        <Text style={styles.videTitre}>Bibliothèque vide</Text>
        <Text style={styles.videIndication}>Ajoutez des livres pour voir vos statistiques.</Text>
      </View>
    );
  }

  const pctLus    = stats.total > 0 ? Math.round((stats.lus    / stats.total) * 100) : 0;
  const pctNonLus = 100 - pctLus;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <Text style={styles.sectionTitre}>Vue d'ensemble</Text>
      <View style={styles.grid2}>
        <CarteChiffre iconName="library-outline"       valeur={stats.total}   label="Livres au total" couleur={Colors.primary} />
        <CarteChiffre iconName="checkmark-circle-outline" valeur={stats.lus}  label="Lus"             couleur={Colors.success} />
        <CarteChiffre iconName="book-outline"          valeur={stats.nonLus}  label="Non lus"         couleur={Colors.accent}  />
        <CarteChiffre iconName="star-outline"          valeur={stats.favoris} label="Favoris"         couleur={Colors.gold}    />
      </View>

      <Text style={styles.sectionTitre}>Note moyenne</Text>
      <View style={styles.cardNote}>
        <Text style={styles.noteMoyValeur}>
          {stats.noteMoyenne > 0 ? stats.noteMoyenne : '—'}
        </Text>
        {stats.noteMoyenne > 0 && <Text style={styles.noteMoySur}>/ 5</Text>}
        {stats.noteMoyenne > 0
          ? <EtoilesNote note={stats.noteMoyenne} />
          : <Ionicons name="star-outline" size={28} color={Colors.border} style={{ marginTop: 6 }} />
        }
        <Text style={styles.noteCaption}>
          {stats.noteMoyenne > 0 ? 'Calculée sur les livres notés' : 'Aucun livre noté'}
        </Text>
      </View>

      <Text style={styles.sectionTitre}>Progression de lecture</Text>
      <View style={styles.cardProg}>
        <View style={styles.progLabels}>
          <Text style={styles.progLabel}>Lu · {pctLus}%</Text>
          <Text style={styles.progLabel}>Non lu · {pctNonLus}%</Text>
        </View>
        <View style={styles.barreContainer}>
          <View style={[styles.barreLu,    { flex: pctLus    || 0.001 }]} />
          <View style={[styles.barreNonLu, { flex: pctNonLus || 0.001 }]} />
        </View>
        <View style={styles.progLabels}>
          <View style={styles.légende}>
            <View style={[styles.légendePoint, { backgroundColor: Colors.success }]} />
            <Text style={styles.légendeTexte}>{stats.lus} lu{stats.lus > 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.légende}>
            <View style={[styles.légendePoint, { backgroundColor: Colors.accent }]} />
            <Text style={styles.légendeTexte}>{stats.nonLus} non lu{stats.nonLus > 1 ? 's' : ''}</Text>
          </View>
        </View>
      </View>

      {stats.genres.length > 0 && (
        <>
          <Text style={styles.sectionTitre}>Top genres</Text>
          <View style={styles.cardGenres}>
            {stats.genres.map((g, i) => {
              const width = Math.round((g.n / stats.genres[0].n) * 100);
              return (
                <View key={g.genre} style={styles.genreLigne}>
                  <Text style={styles.genreRank}>#{i + 1}</Text>
                  <View style={styles.genreInfo}>
                    <View style={styles.genreBarreContainer}>
                      <View style={[styles.genreBarre, { width: `${width}%` }]} />
                    </View>
                    <View style={styles.genreTextes}>
                      <Text style={styles.genreNom} numberOfLines={1}>{g.genre}</Text>
                      <Text style={styles.genreCount}>{g.n} livre{g.n > 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: Colors.background, padding: 16 },
  centré:             { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background, gap: 10 },
  videTitre:          { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
  videIndication:     { fontSize: 13, color: Colors.textLight, textAlign: 'center', paddingHorizontal: 30 },
  sectionTitre:       { fontSize: 12, fontWeight: '800', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 8 },
  grid2:              { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  carteChiffre:       { flex: 1, minWidth: '45%', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16, borderLeftWidth: 4, ...Shadow.md },
  carteValeur:        { fontSize: 30, fontWeight: '900' },
  carteLabel:         { fontSize: 12, color: Colors.textSecondary, marginTop: 2, fontWeight: '500' },
  cardNote:           { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 24, alignItems: 'center', marginBottom: 20, ...Shadow.md },
  noteMoyValeur:      { fontSize: 56, fontWeight: '900', color: Colors.primary },
  noteMoySur:         { fontSize: 20, color: Colors.textLight, marginTop: -8 },
  noteCaption:        { fontSize: 12, color: Colors.textLight, marginTop: 10 },
  cardProg:           { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 18, marginBottom: 20, ...Shadow.md },
  progLabels:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progLabel:          { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  barreContainer:     { flexDirection: 'row', height: 14, borderRadius: Radius.full, overflow: 'hidden', marginBottom: 12 },
  barreLu:            { backgroundColor: Colors.success },
  barreNonLu:         { backgroundColor: Colors.accent },
  légende:            { flexDirection: 'row', alignItems: 'center', gap: 6 },
  légendePoint:       { width: 10, height: 10, borderRadius: 5 },
  légendeTexte:       { fontSize: 13, color: Colors.textSecondary },
  cardGenres:         { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 18, marginBottom: 20, ...Shadow.md },
  genreLigne:         { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  genreRank:          { width: 28, fontSize: 13, fontWeight: '800', color: Colors.textLight },
  genreInfo:          { flex: 1 },
  genreBarreContainer:{ height: 8, backgroundColor: Colors.border, borderRadius: Radius.full, marginBottom: 4, overflow: 'hidden' },
  genreBarre:         { height: 8, backgroundColor: Colors.primary, borderRadius: Radius.full },
  genreTextes:        { flexDirection: 'row', justifyContent: 'space-between' },
  genreNom:           { fontSize: 14, color: Colors.textPrimary, fontWeight: '600', flex: 1 },
  genreCount:         { fontSize: 12, color: Colors.textLight },
});
