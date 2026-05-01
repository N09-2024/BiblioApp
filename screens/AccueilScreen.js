import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Image, StyleSheet, Alert, ActivityIndicator, Modal, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getLivres, supprimerLivre, getGenres } from '../database';
import { Colors, Radius, Shadow } from '../theme';

const TRIS = [
  { label: 'Plus récent',    value: 'id_desc'   },
  { label: 'Titre A → Z',   value: 'titre_asc'  },
  { label: 'Meilleure note', value: 'note_desc'  },
  { label: 'Date de lecture',value: 'date_desc'  },
];

function Etoiles({ note, size = 13 }) {
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1,2,3,4,5].map(i => (
        <Ionicons key={i} name={i <= note ? 'star' : 'star-outline'}
          size={size} color={i <= note ? Colors.gold : Colors.border} />
      ))}
    </View>
  );
}

export default function AccueilScreen({ navigation }) {
  const [livres,       setLivres]       = useState([]);
  const [recherche,    setRecherche]    = useState('');
  const [filtreStatut, setFiltreStatut] = useState(-1);
  const [filtreNote,   setFiltreNote]   = useState(0);
  const [filtreGenre,  setFiltreGenre]  = useState('');
  const [tri,          setTri]          = useState('id_desc');
  const [genres,       setGenres]       = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [showTri,      setShowTri]      = useState(false);
  const [showGenres,   setShowGenres]   = useState(false);

  useFocusEffect(
    useCallback(() => { chargerTout(); }, [recherche, filtreStatut, filtreNote, filtreGenre, tri])
  );

  async function chargerTout() {
    setLoading(true);
    try {
      const [data, g] = await Promise.all([
        getLivres({ recherche, genre: filtreGenre, statut: filtreStatut, noteMin: filtreNote, tri }),
        getGenres(),
      ]);
      setLivres(data);
      setGenres(g);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les livres.');
    } finally {
      setLoading(false);
    }
  }

  function confirmerSuppression(id, titre) {
    Alert.alert('Supprimer', `Supprimer "${titre}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await supprimerLivre(id); chargerTout(); } },
    ]);
  }

  const triLabel = TRIS.find(t => t.value === tri)?.label ?? 'Trier';

  return (
    <View style={styles.container}>

      {/* ── Barre de recherche ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color={Colors.textLight} style={{ marginRight: 6 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Titre, auteur…"
            placeholderTextColor={Colors.textLight}
            value={recherche}
            onChangeText={setRecherche}
          />
          {recherche.length > 0 && (
            <TouchableOpacity onPress={() => setRecherche('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.btnIcone} onPress={() => navigation.navigate('Stats')}>
          <Ionicons name="bar-chart-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnIcone} onPress={() => navigation.navigate('Favoris')}>
          <Ionicons name="star-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Filtres ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtresScroll} contentContainerStyle={styles.filtresContent}>
        {[{ l: 'Tous', v: -1 }, { l: 'Lu', v: 1 }, { l: 'Non lu', v: 0 }].map(f => (
          <TouchableOpacity key={f.v} style={[styles.chip, filtreStatut === f.v && styles.chipActif]}
            onPress={() => setFiltreStatut(f.v)}>
            <Text style={[styles.chipTxt, filtreStatut === f.v && styles.chipTxtActif]}>{f.l}</Text>
          </TouchableOpacity>
        ))}

        {[{ l: 'Toutes notes', n: 0 }, { l: '3+ étoiles', n: 3 }, { l: '4+ étoiles', n: 4 }, { l: '5 étoiles', n: 5 }].map(f => (
          <TouchableOpacity key={f.n} style={[styles.chip, filtreNote === f.n && styles.chipActif]}
            onPress={() => setFiltreNote(f.n)}>
            <Text style={[styles.chipTxt, filtreNote === f.n && styles.chipTxtActif]}>{f.l}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.chip, filtreGenre !== '' && styles.chipActif]}
          onPress={() => setShowGenres(true)}>
          <Ionicons name="pricetag-outline" size={12} color={filtreGenre !== '' ? '#fff' : Colors.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.chipTxt, filtreGenre !== '' && styles.chipTxtActif]}>{filtreGenre || 'Genre'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.chip, styles.chipTri]} onPress={() => setShowTri(true)}>
          <Ionicons name="swap-vertical-outline" size={12} color="#fff" style={{ marginRight: 4 }} />
          <Text style={styles.chipTxtActif}>{triLabel}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Compteur ── */}
      <Text style={styles.compteur}>{livres.length} livre{livres.length !== 1 ? 's' : ''}</Text>

      {/* ── Liste ── */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
      ) : livres.length === 0 ? (
        <View style={styles.vide}>
          <Ionicons name="library-outline" size={64} color={Colors.border} />
          <Text style={styles.videTitre}>Aucun livre trouvé</Text>
          <Text style={styles.videIndication}>Ajustez les filtres ou appuyez sur + pour ajouter un livre</Text>
        </View>
      ) : (
        <FlatList
          data={livres}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.carte}
              onPress={() => navigation.navigate('Detail', { livreId: item.id })}
              onLongPress={() => confirmerSuppression(item.id, item.titre)}
            >
              {item.photo ? (
                <Image source={{ uri: item.photo }} style={styles.miniPhoto} />
              ) : (
                <View style={styles.miniPhotoPlaceholder}>
                  <Ionicons name="book-outline" size={24} color={Colors.primary} />
                </View>
              )}
              <View style={styles.carteInfo}>
                <Text style={styles.carteTitre} numberOfLines={1}>{item.titre}</Text>
                <Text style={styles.carteAuteur} numberOfLines={1}>{item.auteur}</Text>
                <Etoiles note={item.note} size={12} />
                {item.genre ? <Text style={styles.carteGenre}>{item.genre}</Text> : null}
              </View>
              <View style={styles.carteBadges}>
                <View style={[styles.badge, item.lu ? styles.badgeLu : styles.badgeNonLu]}>
                  <Text style={[styles.badgeTxt, item.lu ? styles.badgeTxtLu : styles.badgeTxtNonLu]}>
                    {item.lu ? 'Lu' : 'Non lu'}
                  </Text>
                </View>
                {item.favori === 1 && (
                  <Ionicons name="star" size={16} color={Colors.gold} />
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('Formulaire', { livre: null })}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* ── Modal Tri ── */}
      <Modal visible={showTri} transparent animationType="fade" onRequestClose={() => setShowTri(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowTri(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitre}>Trier par</Text>
            {TRIS.map(t => (
              <TouchableOpacity key={t.value} style={[styles.modalOption, tri === t.value && styles.modalOptionActif]}
                onPress={() => { setTri(t.value); setShowTri(false); }}>
                {tri === t.value && <Ionicons name="checkmark" size={16} color={Colors.primary} style={{ marginRight: 8 }} />}
                <Text style={[styles.modalOptionTxt, tri === t.value && styles.modalOptionTxtActif]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Modal Genres ── */}
      <Modal visible={showGenres} transparent animationType="fade" onRequestClose={() => setShowGenres(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowGenres(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitre}>Filtrer par genre</Text>
            <TouchableOpacity style={[styles.modalOption, filtreGenre === '' && styles.modalOptionActif]}
              onPress={() => { setFiltreGenre(''); setShowGenres(false); }}>
              {filtreGenre === '' && <Ionicons name="checkmark" size={16} color={Colors.primary} style={{ marginRight: 8 }} />}
              <Text style={[styles.modalOptionTxt, filtreGenre === '' && styles.modalOptionTxtActif]}>Tous les genres</Text>
            </TouchableOpacity>
            {genres.map(g => (
              <TouchableOpacity key={g} style={[styles.modalOption, filtreGenre === g && styles.modalOptionActif]}
                onPress={() => { setFiltreGenre(g); setShowGenres(false); }}>
                {filtreGenre === g && <Ionicons name="checkmark" size={16} color={Colors.primary} style={{ marginRight: 8 }} />}
                <Text style={[styles.modalOptionTxt, filtreGenre === g && styles.modalOptionTxtActif]}>{g}</Text>
              </TouchableOpacity>
            ))}
            {genres.length === 0 && <Text style={styles.videIndication}>Aucun genre enregistré</Text>}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: Colors.background },
  searchRow:           { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  searchBox:           { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  searchInput:         { flex: 1, fontSize: 14, color: Colors.textPrimary, padding: 0 },
  btnIcone:            { backgroundColor: Colors.surface, width: 42, height: 42, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  filtresScroll:       { flexGrow: 0, paddingVertical: 4 },
  filtresContent:      { paddingHorizontal: 12, gap: 8 },
  chip:                { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  chipActif:           { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTri:             { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  chipTxt:             { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  chipTxtActif:        { fontSize: 12, color: '#fff', fontWeight: '600' },
  compteur:            { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, fontSize: 12, color: Colors.textLight },
  carte:               { flexDirection: 'row', backgroundColor: Colors.surface, marginHorizontal: 12, marginBottom: 10, borderRadius: Radius.lg, padding: 12, alignItems: 'center', ...Shadow.md },
  miniPhoto:           { width: 48, height: 68, borderRadius: Radius.sm, marginRight: 12 },
  miniPhotoPlaceholder:{ width: 48, height: 68, borderRadius: Radius.sm, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  carteInfo:           { flex: 1, gap: 4 },
  carteTitre:          { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  carteAuteur:         { fontSize: 13, color: Colors.textSecondary },
  carteGenre:          { fontSize: 11, color: Colors.primary, fontStyle: 'italic' },
  carteBadges:         { alignItems: 'flex-end', gap: 6 },
  badge:               { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  badgeLu:             { backgroundColor: Colors.successLight },
  badgeNonLu:          { backgroundColor: Colors.dangerLight },
  badgeTxt:            { fontSize: 11, fontWeight: '600' },
  badgeTxtLu:          { color: Colors.success },
  badgeTxtNonLu:       { color: Colors.danger },
  vide:                { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 10 },
  videTitre:           { fontSize: 17, fontWeight: '700', color: Colors.textSecondary },
  videIndication:      { fontSize: 13, color: Colors.textLight, textAlign: 'center' },
  fab:                 { position: 'absolute', bottom: 24, right: 24, backgroundColor: Colors.primary, width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', ...Shadow.lg },
  overlay:             { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox:            { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: 20, width: '80%', ...Shadow.lg },
  modalTitre:          { fontSize: 17, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  modalOption:         { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: Radius.md, marginBottom: 2 },
  modalOptionActif:    { backgroundColor: Colors.primaryLight },
  modalOptionTxt:      { fontSize: 15, color: Colors.textSecondary },
  modalOptionTxtActif: { fontSize: 15, color: Colors.primary, fontWeight: '700' },
});