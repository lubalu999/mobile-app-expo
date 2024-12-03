import React, { useState, useEffect } from "react";
import { Image, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import * as rickMortyApi from "rickmortyapi";
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

async function getCharactersRickAndMorty() {
  const initialResponse = await rickMortyApi.getCharacters();

  if (initialResponse?.status !== 200 || !initialResponse?.data?.info?.pages) {
    return [];
  }

  const totalPages = initialResponse.data.info.pages;
  const requests = Array.from({ length: totalPages }, (_, i) => rickMortyApi.getCharacters({ page: i + 1 }));

  const responses = await Promise.all(requests);

  return responses.filter((response) => response?.status === 200).flatMap((response) => response.data.results || []);
}

export default function HomeScreen() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    const loadCharacters = async () => {
      const data = await getCharactersRickAndMorty();
      setCharacters(data);
    };
    loadCharacters();
  }, []);

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
        <Image source={require("@/assets/images/header.png")} style={styles.logo} />
        <FlatList
          data={characters}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <>
              <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Rick and Morty Characters</ThemedText>
              </ThemedView>
            </>
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#transparent",
    marginVertical: 20,
    marginHorizontal: 20,
    resizeMode: "center",
    gap: 8,
  },
  logo: {
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
    marginHorizontal: 56,
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
