import React, { useState, useEffect } from "react";
import { Image, FlatList, StatusBar, StyleSheet, Platform, Text, TouchableOpacity } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import * as rickMortyApi from "rickmortyapi";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

type Character = {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
};

type ItemProps = {
  character: Character;
  onPress: () => void;
  backgroundColor: string;
  textColor: string;
};

const Item = ({ character, onPress, backgroundColor, textColor }: ItemProps) => (
  <TouchableOpacity onPress={onPress} style={[styles.item, { backgroundColor }]}>
    <Image source={{ uri: character.image }} style={styles.image} />
    <Text style={[styles.title, { color: textColor }]}>{character.name}</Text>
  </TouchableOpacity>
);

async function getCharactersPage(page: number) {
  const response = await rickMortyApi.getCharacters({ page });
  if (response?.status === 200 && response?.data?.results) {
    return response.data.results;
  }
  return [];
}

export default function HomeScreen() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const loadInitialCharacters = async () => {
      const initialData = await getCharactersPage(page);
      setCharacters(initialData);
      setLoading(false);
      if (initialData.length < 20) {
        setHasMore(false);
      }
    };

    loadInitialCharacters();
  }, []);

  const loadMoreCharacters = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;
    const newCharacters = await getCharactersPage(nextPage);

    if (newCharacters.length > 0) {
      setCharacters((prevCharacters) => [...prevCharacters, ...newCharacters]);
      setPage(nextPage);
    } else {
      setHasMore(false);
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: Character }) => {
    const backgroundColor = item.id === selectedId ? "#6e3b6e" : "#f9c2ff";
    const color = item.id === selectedId ? "white" : "black";

    return (
      <Item
        character={item}
        onPress={() => setSelectedId(item.id)}
        backgroundColor={backgroundColor}
        textColor={color}
      />
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
          headerImage={<Image source={require("@/assets/images/header.png")} style={styles.reactLogo} />}
        >
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Rick and Morty Characters</ThemedText>
          </ThemedView>
          <FlatList
            data={characters}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            onEndReached={loadMoreCharacters}
            onEndReachedThreshold={0.1}
            ListFooterComponent={loading ? <Text style={styles.loadingText}>Loading...</Text> : null}
          />
        </ParallaxScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reactLogo: {
    height: "100%",
    width: "100%",
    bottom: 0,
    left: 0,
    position: "absolute",
    resizeMode: "center",
  },
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight || 0,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    marginLeft: 16,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  loadingText: {
    textAlign: "center",
    padding: 10,
  },
});
