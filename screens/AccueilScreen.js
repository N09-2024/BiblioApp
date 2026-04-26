import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { initDB, getLivres, supprimerLivre } from '../database';

export default function AccueilScreen({ navigation }) {
  const [livres, setLivres] = useState([]);
  const [recherche, setRecherche] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function setup() {
        await initDB();
        await chargerLivres();
      }
      setup();
    }, [recherche])
  );

  async function chargerLivres() {
    const data = await getLivres(recherche);
    setLivres(data);
  }

  function confirmerSuppression(id) {
    Alert.alert('Supprimer', 'Voulez-vous vraiment supprimer ce livre ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => { await supprimerLivre(id); await chargerLivres(); }
      },
    ]);
  }

  function etoiles(note) { return '★'.repeat(note) + '☆'.repeat(5 - note); }

  function CarteLivre({ item }) {
    return (
      <TouchableOpacity style={styles.carte} onPress={() => navigation.navigate('Detail', { livre: item })}>
        <View style={styles.carteInfo}>
          <Text style={styles.titre}>{item.titre}</Text>
          <Text style={styles.auteur}>{item.auteur}</Text>
          <Text style={styles.etoiles}>{etoiles(item.note)}</Text>
        </View>
        <View style={styles.carteBadges}>
          <Text style={[styles.badge, item.lu ? styles.lu : styles.nonLu]}>
            {item.lu ? 'Lu' : 'Non lu'}
          </Text>
          {item.favori === 1 && <Text style={styles.favori}>⭐</Text>}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.recherche}
        placeholder="🔍 Rechercher par titre ou auteur..."
        value={recherche}
        onChangeText={setRecherche}
      />
      <TouchableOpacity style={styles.boutonFavoris} onPress={() => navigation.navigate('Favoris')}>
        <Text style={styles.boutonFavorisTexte}>⭐ Voir mes favoris</Text>
      </TouchableOpacity>
      {livres.length === 0 ? (
        <Text style={styles.vide}>Aucun livre. Appuyez sur + pour en ajouter !</Text>
      ) : (
        <FlatList data={livres} keyExtractor={(item) => item.id.toString()} renderItem={({ item }) => <CarteLivre item={item} />} />
      )}
      <TouchableOpacity style={styles.boutonAjouter} onPress={() => navigation.navigate('Formulaire', { livre: null })}>
        <Text style={styles.boutonAjouterTexte}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 12 },
  recherche: { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 14 },
  boutonFavoris: { backgroundColor: '#fff3cd', padding: 10, borderRadius: 10, marginBottom: 10, alignItems: 'center', borderWidth: 1, borderColor: '#ffc107' },
  boutonFavorisTexte: { color: '#856404', fontWeight: 'bold' },
  carte: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', elevation: 2 },
  carteInfo: { flex: 1 },
  titre: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  auteur: { fontSize: 13, color: '#666', marginTop: 2 },
  etoiles: { fontSize: 14, color: '#f4a41b', marginTop: 4 },
  carteBadges: { alignItems: 'flex-end', justifyContent: 'space-between' },
  badge: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  lu: { backgroundColor: '#d4edda', color: '#155724' },
  nonLu: { backgroundColor: '#f8d7da', color: '#721c24' },
  favori: { fontSize: 18 },
  vide: { textAlign: 'center', marginTop: 60, color: '#999', fontSize: 15 },
  boutonAjouter: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#4a90e2', width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  boutonAjouterTexte: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
});