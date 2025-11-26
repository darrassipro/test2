import { useEffect, useMemo, useRef, useState } from "react";
import { View, Image, Dimensions, Pressable, Text, StatusBar, Animated, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetStoriesByUserQuery } from "@/services/storyApi";

const STORY_DURATION_MS = 5000;

export default function StoryViewer() {
    const params = useLocalSearchParams<{ userId: string | string[] }>();
    const screenWidth = Dimensions.get("window").width;
    const progress = useRef(new Animated.Value(0)).current;
    const animRef = useRef<Animated.CompositeAnimation | null>(null);
    const pauseRef = useRef(false);
    const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

    // Normaliser userId (peut être un tableau dans certains cas)
    const userId = useMemo(() => {
        const id = params.userId;
        if (Array.isArray(id)) {
            return id[0] || '';
        }
        return id || '';
    }, [params.userId]);

    // Récupérer toutes les stories de l'utilisateur depuis l'API
    const { data, isLoading, error } = useGetStoriesByUserQuery(userId, {
        skip: !userId, // Ne pas faire la requête si l'userId n'est pas disponible
        // Forcer le refetch pour éviter les problèmes de cache
        refetchOnMountOrArgChange: true,
    });

    // Extraire les stories depuis la réponse
    const stories = useMemo(() => {
        return data?.data?.stories || [];
    }, [data]);

    // Story actuelle
    const currentStory = useMemo(() => {
        if (stories.length === 0 || currentStoryIndex >= stories.length) {
            return null;
        }
        return stories[currentStoryIndex];
    }, [stories, currentStoryIndex]);

    // Fonction pour démarrer l'animation de progression
    const start = (duration: number) => {
        if (!currentStory) return;

        animRef.current = Animated.timing(progress, {
            toValue: 1,
            duration,
            useNativeDriver: false,
        });
        animRef.current.start(({ finished }) => {
            if (finished) {
                // Passer à la story suivante
                handleNextStory();
            }
        });
    };

    // Réinitialiser et démarrer l'animation quand la story change
    useEffect(() => {
        if (!currentStory) return;

        // Réinitialiser seulement quand on change de story (pas quand on reprend la pause)
        const lastStoryIndex = (progress as any).__lastStoryIndex;
        if (currentStoryIndex !== lastStoryIndex) {
            progress.setValue(0);
            (progress as any).__lastStoryIndex = currentStoryIndex;
            (progress as any).__savedProgress = null; // Réinitialiser la progression sauvegardée
        }

        if (!isPaused) {
            // Si on a une valeur de progression sauvegardée, reprendre depuis là
            const savedProgress = (progress as any).__savedProgress;
            if (savedProgress !== undefined && savedProgress !== null && savedProgress > 0) {
                progress.setValue(savedProgress);
                const remaining = STORY_DURATION_MS * (1 - savedProgress);
                start(remaining);
                (progress as any).__savedProgress = null; // Réinitialiser après utilisation
            } else {
                // Sinon, démarrer normalement
                start(STORY_DURATION_MS);
            }
        } else {
            // Si on met en pause, arrêter l'animation
            animRef.current?.stop();
        }

        return () => {
            animRef.current?.stop();
            // Nettoyer le timeout si le composant se démonte ou change de story
            if (pauseTimeoutRef.current) {
                clearTimeout(pauseTimeoutRef.current);
                pauseTimeoutRef.current = null;
            }
        };
    }, [currentStoryIndex, currentStory, isPaused]);

    // Fonction pour passer à la story suivante
    const handleNextStory = () => {
        if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
        } else {
            // Plus de stories, retourner en arrière
            router.back();
        }
    };

    // Fonction pour passer à la story précédente
    const handlePreviousStory = () => {
        if (currentStoryIndex > 0) {
            setCurrentStoryIndex(currentStoryIndex - 1);
        } else {
            // Première story, retourner en arrière
            router.back();
        }
    };

    // Gestion du clic pour naviguer (Instagram-like)
    const handlePress = (event: any) => {
        // Ne pas naviguer si on est en pause
        if (isPaused) return;

        const { locationX } = event.nativeEvent;
        const currentScreenWidth = Dimensions.get("window").width;
        const middlePoint = currentScreenWidth / 2;

        if (locationX < middlePoint) {
            // Clic à gauche du milieu = story précédente
            handlePreviousStory();
        } else {
            // Clic à droite du milieu = story suivante
            handleNextStory();
        }
    };

    const onPressIn = () => {
        // Si déjà en pause, ne rien faire
        if (pauseRef.current) return;
        
        // Démarrer un timeout de 0.5 secondes avant de mettre en pause
        pauseTimeoutRef.current = setTimeout(() => {
            // Après 0.5 secondes, mettre en pause
            setIsPaused(true);
            pauseRef.current = true;
            progress.stopAnimation((value: number) => {
                // Sauvegarder la valeur de progression actuelle (0-1)
                (progress as any).__savedProgress = value;
                animRef.current = null;
            });
        }, 100); // 0.5 secondes
    };

    const onPressOut = () => {
        // Annuler le timeout si l'utilisateur relâche avant 0.5 secondes
        if (pauseTimeoutRef.current) {
            clearTimeout(pauseTimeoutRef.current);
            pauseTimeoutRef.current = null;
        }
        
        // Si déjà en pause, reprendre
        if (pauseRef.current) {
            setIsPaused(false);
            pauseRef.current = false;
            // La reprise sera gérée par le useEffect qui détecte le changement de isPaused
        }
    };

    // Calculer la largeur de chaque segment de barre de progression
    const progressBarSegmentWidth = useMemo(() => {
        if (stories.length === 0) return 0;
        return (screenWidth - 24 - (stories.length - 1) * 4) / stories.length; // 24 = padding horizontal, 4 = gap
    }, [stories.length, screenWidth]);

    // Afficher un loader pendant le chargement
    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: "#000" }}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text className="text-white mt-4">Chargement des stories...</Text>
            </SafeAreaView>
        );
    }

    // Gérer les erreurs
    if (error) {
        const errorMessage = (error as any)?.data?.error || (error as any)?.data?.message || 'Erreur lors du chargement des stories';
        return (
            <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: "#000" }}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <Text className="text-white text-lg mb-2">Erreur</Text>
                <Text className="text-white/70 text-sm mb-4 text-center px-4">{errorMessage}</Text>
                <Pressable onPress={() => router.back()} className="px-6 py-3 bg-white/20 rounded-full">
                    <Text className="text-white">Retour</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    // Gérer le cas où il n'y a pas de stories
    if (!isLoading && stories.length === 0) {
        return (
            <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: "#000" }}>
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <Text className="text-white text-lg mb-4">Aucune story trouvée</Text>
                <Pressable onPress={() => router.back()} className="px-6 py-3 bg-white/20 rounded-full">
                    <Text className="text-white">Retour</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    if (!currentStory) {
        return null;
    }

    // Calculer la largeur de chaque barre de progression
    const progressBarWidth = screenWidth / stories.length;

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: "#000" }}>
            <StatusBar hidden animated />
            {/* Progress bars pour toutes les stories */}
            <View className="px-3 pt-3">
                <View className="flex-row h-1.5 gap-1">
                    {stories.map((_story: any, index: number) => {
                        const isActive = index === currentStoryIndex;
                        const isCompleted = index < currentStoryIndex;

                        return (
                            <View
                                key={index}
                                className="flex-1 bg-white/30 rounded-full overflow-hidden"
                                style={{ height: 6 }}
                            >
                                {isActive ? (
                                    <Animated.View
                                        style={{
                                            width: progress.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, progressBarSegmentWidth],
                                            }),
                                            height: 6,
                                            backgroundColor: "#fff",
                                        }}
                                    />
                                ) : isCompleted ? (
                                    <View className="h-full bg-white" style={{ width: '100%' }} />
                                ) : null}
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Story content avec navigation Instagram-like */}
            <View className="flex-1 relative">
                {/* Image de la story - ne bloque pas les événements */}
                <View className="absolute inset-0" pointerEvents="none">
                    <Image
                        source={{ uri: currentStory.mediaUrl }}
                        className="w-full h-full"
                        resizeMode="contain"
                    />
                </View>
                
                {/* Zone de navigation transparente qui capture tous les événements */}
                <Pressable
                    className="absolute inset-0"
                    onPress={handlePress}
                    onPressIn={onPressIn}
                    onPressOut={onPressOut}
                    delayLongPress={150}
                    android_disableSound
                >
                    <View className="flex-1" />
                </Pressable>
                
                {/* Indicateur de pause */}
                {isPaused ? (
                    <View className="absolute bottom-6 left-0 right-0 items-center" pointerEvents="none">
                        <View className="px-3 py-1.5 rounded-full bg-white/20">
                            <Text className="text-white">Paused</Text>
                        </View>
                    </View>
                ) : null}
            </View>

            {/* Informations de l'auteur en haut */}
            {currentStory.author && (
                <View className="absolute top-[65px] left-4 right-4 flex-row items-center">
                    <Image
                        source={{ uri: currentStory.author.profileImage || "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=50" }}
                        className="w-10 h-10 rounded-full border-2 border-white"
                    />
                    <Text className="text-white font-semibold ml-3">
                        {`${currentStory.author.firstName || ''} ${currentStory.author.lastName || ''}`.trim()}
                    </Text>
                    <Text className="text-white/70 ml-2">
                        {new Date(currentStory.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}

