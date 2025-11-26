import React, { useImperativeHandle, useMemo, useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity, Animated, PanResponder, Dimensions, StatusBar } from "react-native";
import { router } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/services/slices/userSlice";
import type { CardRotateProps, StackProps } from "@/types/interfaces";



function CardRotate({ children, onSendToBack, sensitivity }: CardRotateProps) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const rotateX = y.interpolate({ inputRange: [-100, 100], outputRange: ["60deg", "-60deg"] });
  const rotateY = x.interpolate({ inputRange: [-100, 100], outputRange: ["-60deg", "60deg"] });
  const sentRef = useRef(false);

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gesture) => {
        Animated.event([null, { dx: x, dy: y }], { useNativeDriver: false })(e, gesture);
        if (!sentRef.current && (Math.abs(gesture.dx) > sensitivity || Math.abs(gesture.dy) > sensitivity)) {
          sentRef.current = true;
          onSendToBack();
          // reset local transforms pour éviter un saut visuel lorsque la carte passe derrière
          Animated.spring(x, { toValue: 0, useNativeDriver: false, speed: 14, bounciness: 8 }).start(() => {
            sentRef.current = false;
          });
          Animated.spring(y, { toValue: 0, useNativeDriver: false, speed: 14, bounciness: 8 }).start();
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (!sentRef.current && (Math.abs(gesture.dx) > sensitivity || Math.abs(gesture.dy) > sensitivity)) {
          onSendToBack();
        } else {
          Animated.spring(x, { toValue: 0, useNativeDriver: false }).start();
          Animated.spring(y, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...pan.panHandlers}
      style={{
        position: "absolute",
        transform: [{ perspective: 600 }, { translateX: x }, { translateY: y }, { rotateX }, { rotateY }],
      }}
    >
      {children}
    </Animated.View>
  );
}



type StackHandle = { next: () => void };

const Stack = React.forwardRef<StackHandle, StackProps>(function Stack(
  {
  randomRotation = false,
  sensitivity = 60,
  cardDimensions = { width: Dimensions.get("window").width * 0.78, height: Dimensions.get("window").height * 0.58 },
  cardsData = [],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  }: StackProps,
  ref
) {

  const [cards, setCards] = useState(
    cardsData.length
      ? cardsData
      : [
          { id: 1, img: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=1200&auto=format" },
          { id: 2, img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=1200&auto=format" },
          { id: 3, img: "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=1200&auto=format" },
          { id: 4, img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=1200&auto=format" },
        ]
  );

  const sendToBack = (id: number) => {
    setCards((prev) => {
      const next = [...prev];
      const idx = next.findIndex((c) => c.id === id);
      const [card] = next.splice(idx, 1);
      next.unshift(card);
      return next;
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      next: () => {
        if (cards.length > 0) {
          // le premier élément visuel est le dernier de la pile (index cards.length-1)
          const topId = cards[cards.length - 1].id;
          sendToBack(topId);
        }
      },
    }),
    [cards]
  );

  return (
    <View
      style={{
        width: cardDimensions.width,
        height: cardDimensions.height,
        position: "relative",
      }}
    >
      {cards.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;
        const depth = cards.length - index - 1; // 0 = top
        const rotateZ = `${depth * 10 + randomRotate}deg`;
        const scale = 1 + index * 0.07 - cards.length * 0.07;

        return (
          <CardRotate key={card.id} onSendToBack={() => sendToBack(card.id)} sensitivity={sensitivity}>
            <Animated.View
              style={{
                width: cardDimensions.width,
                height: cardDimensions.height,
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 4,
                borderColor: "#fff",
                transform: [{ rotateZ }, { scale }],
              }}
            >
              <Image source={{ uri: card.img }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            </Animated.View>
          </CardRotate>
        );
      })}
    </View>
  );
});

export default function Onboarding() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const images = useMemo(
    () => [
      { id: 1, img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format" },
      { id: 2, img: "https://images.unsplash.com/photo-1489367874814-f5d040621dd8?q=80&w=1200&auto=format" },
      { id: 3, img: "https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?q=80&w=1200&auto=format" },
      { id: 4, img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=1200&auto=format" },
    ],
    []
  );
  const stackRef = useRef<StackHandle>(null);

  // Fonction pour gérer la navigation après "Next"
  const handleNext = () => {
    if (isAuthenticated) {
      // Si l'utilisateur est connecté, rediriger directement vers (tabs)
      router.replace("/(tabs)");
    } else {
      // Sinon, passer à la carte suivante
      stackRef.current?.next();
    }
  };

  // Fonction pour gérer la navigation vers la page suivante
  const handleStart = () => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    } else {
      router.replace("/login");
    }
  };

  useEffect(() => {
    // Couleur de la barre système Android sur cette page
    (async () => {
      try {
        await NavigationBar.setBackgroundColorAsync("#4A0D17");
        await NavigationBar.setButtonStyleAsync("light");
      } catch {}
    })();
  }, []);

  return (
    <View className="flex-1 bg-[#4A0D17] items-center justify-center">
      <StatusBar hidden animated />
      <View className="absolute right-4 top-10 z-10">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
          onPress={() => router.replace("/(tabs)")}
        >
          <Text className="text-white text-xl">×</Text>
        </TouchableOpacity>
      </View>

      <View className="px-6 pt-24">
        <Text className="text-white text-center text-2xl font-semibold leading-8">
          Share your journeys, discover new places, and connect with like-minded explorers.
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <Stack ref={stackRef} randomRotation sensitivity={120} sendToBackOnClick={false} cardsData={images} />
      </View>

      <View className="w-full px-6 pb-12 flex-row items-center justify-between">
        <TouchableOpacity
          className="bg-white/15 rounded-full px-5 py-3"
          onPress={handleNext}
          accessibilityRole="button"
        >
          <Text className="text-white text-lg">Next</Text>
        </TouchableOpacity>
        <TouchableOpacity className="bg-white/15 rounded-full px-5 py-3" onPress={handleStart}>
          <Text className="text-white text-lg">Start →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
