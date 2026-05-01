import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getFavoris, toggleFavori } from '../database';

export default function FavorisScreen({ navigation }) {
  const [favoris, setFavoris] = useState([]);

  useFocusEffect(
    useCallback(() => { chargerFavoris(); }, [])
  );

  async function chargerFavoris() {
    const data = await getFavoris();
    setFavoris(data);
  }

  async function retirerFavori(id) {
    await toggleFavori(id, 1);
    await chargerFavoris();
  }

  function etoiles(note) { return '★'.repeat(note) + '☆'.repeat(5 - note); }

  function CarteFavori({ item }) {
    return (
      // View au lieu de TouchableOpacity pour éviter le conflit d'événements
      <View style={styles.carte}>
        <TouchableOpacity
          style={styles.carteInfo}
          onPress={() => navigation.navigate('Detail', { livre: item })}
        >
          <Text style={styles.titre}>{item.titre}</Text>
          <Text style={styles.auteur}>{item.auteur}</Text>
          <Text style={styles.etoiles}>{etoiles(item.note)}</Text>
        </TouchableOpacity>
        {/* Bouton séparé : n'hérite plus des événements du parent */}
        <TouchableOpacity
          style={styles.boutonRetirer}
          onPress={() => retirerFavori(item.id)}
        >
          <Text style={styles.boutonRetirerTexte}>Retirer ⭐</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {favoris.length === 0 ? (
        <View style={styles.vide}>
          <Text style={styles.videEmoji}>⭐</Text>
          <Text style={styles.videTexte}>Aucun favori pour l'instant.</Text>
          <Text style={styles.videIndication}>
            Ouvrez la fiche d'un livre pour l'ajouter aux favoris.
          </Text>
        </View>
      ) : (
        <FlatList
          data={favoris}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <CarteFavori item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 12 },
  carte: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  carteInfo: { flex: 1 },
  titre: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  auteur: { fontSize: 13, color: '#666', marginTop: 2 },
  etoiles: { fontSize: 14, color: '#f4a41b', marginTop: 4 },
  boutonRetirer: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
    marginLeft: 8,
  },
  boutonRetirerTexte: { color: '#856404', fontSize: 12, fontWeight: '600' },
  vide: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  videEmoji: { fontSize: 60, marginBottom: 12 },
  videTexte: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 6 },
  videIndication: { fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 30 },
});