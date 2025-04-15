import { useLocalSearchParams } from "expo-router"
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ScrollView, Animated } from "react-native"
import * as api from "@/api/api"
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons"
import { useState, useEffect, useCallback, useRef } from "react"
import type { ElementType } from "@/utils/types/type"
import * as SecureStore from "expo-secure-store"
import CommentSection from "@/components/CommentSection"
import { LinearGradient } from "expo-linear-gradient"

// Placeholder for logged-in user data - replace with actual context/auth data
const getLoggedInUsername = async () => await SecureStore.getItem("name")

// Helper function to create a lighter shade of a color for gradients
const createLighterShade = (hexColor: string): string => {
  // Remove the # if it exists
  const hex = hexColor.replace("#", "")

  // Convert to RGB
  const r = Number.parseInt(hex.substring(0, 2), 16)
  const g = Number.parseInt(hex.substring(2, 4), 16)
  const b = Number.parseInt(hex.substring(4, 6), 16)

  // Create a lighter shade (mix with white)
  const lighterR = Math.min(r + 40, 255)
  const lighterG = Math.min(g + 40, 255)
  const lighterB = Math.min(b + 40, 255)

  // Convert back to hex
  return `#${lighterR.toString(16).padStart(2, "0")}${lighterG.toString(16).padStart(2, "0")}${lighterB.toString(16).padStart(2, "0")}`
}

// Element category colors with gradients
const elementColors: Record<string, string[]> = {
  Hidro: ["#a3c7d2", createLighterShade("#a3c7d2")],
  "Group 1": ["#ebbfd8", createLighterShade("#ebbfd8")],
  "Group 2": ["#910048", createLighterShade("#910048")],
  "Group 3": ["#5bc2e7", createLighterShade("#5bc2e7")],
  "Group 4": ["#5bc2e7", createLighterShade("#5bc2e7")],
  "Group 5": ["#5bc2e7", createLighterShade("#5bc2e7")],
  "Group 6": ["#5bc2e7", createLighterShade("#5bc2e7")],
  "Group 7": ["#5bc2e7", createLighterShade("#5bc2e7")],
  "Group 8": ["#5bc2e7", createLighterShade("#5bc2e7")],
  "Group 9": ["#5bc2e7", createLighterShade("#5bc2e7")],
  "Group 10": ["#5bc2e7", createLighterShade("#5bc2e7")],
  "Group 11": ["#5bc2e7", createLighterShade("#5bc2e7")],
  "Group 12": ["#5bc2e7", createLighterShade("#5bc2e7")],
  "Group 13": ["#cedc00", createLighterShade("#cedc00")],
  "Group 14": ["#d1a2cb", createLighterShade("#d1a2cb")],
  "Group 15": ["#e84393", createLighterShade("#e84393")],
  "Group 16": ["#f0b323", createLighterShade("#f0b323")],
  "Group 17": ["#eab37f", createLighterShade("#eab37f")],
  "Group 18": ["#eada24", createLighterShade("#eada24")],
  Lanthanide: ["#00b894", createLighterShade("#00b894")],
  Actinide: ["#8D626A", createLighterShade("#8D626A")],
  unknown: ["#CCCCCC", "#EEEEEE"],
}

export default function ElementDetailScreen() {
  const { id } = useLocalSearchParams()
  const elementId = Number.parseInt(id as string, 10)
  const isValidElementId = !isNaN(elementId)

  const [element, setElement] = useState<ElementType | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)
  const [loggedInUsername, setLoggedInUsername] = useState<string | null>(null)

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  // Fetch username
  useEffect(() => {
    const fetchUsername = async () => {
      const username = await getLoggedInUsername()
      setLoggedInUsername(username)
    }
    fetchUsername()
  }, [])

  // Fetch element details
  useEffect(() => {
    if (!isValidElementId) {
      console.error("Invalid Element ID")
      return
    }

    const fetchElement = async () => {
      const allElements = api.getElements()
      const foundElement = allElements.find((el) => el.atomic_number === elementId)

      if (foundElement) {
        setElement(foundElement)
        // Start animations when element is loaded
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start()
      } else {
        console.error("Element not found")
      }
    }

    fetchElement()
  }, [elementId, isValidElementId, fadeAnim, scaleAnim])

  // Fetch initial favorite status
  useEffect(() => {
    if (!isValidElementId) return

    const fetchStatus = async () => {
      setIsTogglingFavorite(true)
      try {
        const response = await api.getElementFavoriteStatus(elementId)
        if (response && !response.error) {
          setIsFavorite(response.data.active)
        }
      } catch (error: any) {
        console.error("Failed to fetch favorite status:", error.message)
      } finally {
        setIsTogglingFavorite(false)
      }
    }

    fetchStatus()
  }, [elementId, isValidElementId])

  const handleToggleFavorite = useCallback(async () => {
    if (!element || isTogglingFavorite || !isValidElementId) return

    const originalState = isFavorite
    setIsFavorite(!originalState) // Optimistic UI update
    setIsTogglingFavorite(true)

    try {
      await api.toggleElementFavorite(elementId)
      // Success - state already updated optimistically
    } catch (error: any) {
      console.error("Failed to toggle favorite status:", error.message)
      setIsFavorite(originalState) // Revert on error
      Alert.alert("Error", "Could not update favorite status. Please try again.")
    } finally {
      setIsTogglingFavorite(false)
    }
  }, [element, isFavorite, isTogglingFavorite, elementId, isValidElementId])

  // Get gradient colors based on element type
  const getElementGradient = (): string[] => {
    if (!element) return elementColors.unknown

    // Check if the type exists in our color mapping
    if (element.type in elementColors) {
      return elementColors[element.type]
    }

    // Fallback to unknown if type doesn't match
    return elementColors.unknown
  }

  // Determine if text should be white or black based on background color
  const getTextColor = (): string => {
    if (!element) return colors.textLight

    // Get the base color (first color in the gradient)
    const baseColor = element.type in elementColors ? elementColors[element.type][0] : elementColors.unknown[0]

    // Remove the # if it exists
    const hex = baseColor.replace("#", "")

    // Convert to RGB
    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)

    // Calculate luminance - simplified formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Use white text for dark backgrounds, black text for light backgrounds
    return luminance > 0.5 ? colors.textPrimary : colors.textLight
  }

  // Render Loading/Not Found States
  if (!isValidElementId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Invalid Element ID</Text>
      </View>
    )
  }

  if (!element) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textSecondary }}>Loading Element...</Text>
      </View>
    )
  }

  const textColor = getTextColor()

  return (
    <ScrollView
      style={styles.outerContainer}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Element Card */}
      <Animated.View
        style={[
          styles.elementCardContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={getElementGradient() as unknown as readonly [string, string, ...string[]]}
          style={styles.elementCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.elementCardHeader}>
            <Text style={[styles.atomicNumber, { color: textColor }]}>{element.atomic_number}</Text>
            <TouchableOpacity
              onPress={handleToggleFavorite}
              disabled={isTogglingFavorite}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={28}
                color={textColor}
                style={[styles.favoriteIcon, isTogglingFavorite && styles.disabledIcon]}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.elementSymbolContainer}>
            <Text style={[styles.elementSymbol, { color: textColor }]}>{element.symbol}</Text>
          </View>

          <Text style={[styles.elementName, { color: textColor }]}>{element.name}</Text>
          <Text style={[styles.elementCategory, { color: textColor }]}>{element.type}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Element Properties */}
      <View style={styles.propertiesContainer}>
        <View style={styles.propertyRow}>
          <View style={styles.propertyItem}>
            <View style={styles.propertyIconContainer}>
              <MaterialCommunityIcons name="atom" size={24} color={colors.primary} />
            </View>
            <Text style={styles.propertyLabel}>Số hiệu nguyên tử</Text>
            <Text style={styles.propertyValue}>{element.atomic_number}</Text>
          </View>

          <View style={styles.propertyItem}>
            <View style={styles.propertyIconContainer}>
              <MaterialCommunityIcons name="tag-text-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.propertyLabel}>Ký hiệu</Text>
            <Text style={styles.propertyValue}>{element.symbol}</Text>
          </View>
        </View>

        <View style={styles.propertyRow}>
          <View style={styles.propertyItem}>
            <View style={styles.propertyIconContainer}>
              <FontAwesome5 name="table" size={20} color={colors.primary} />
            </View>
            <Text style={styles.propertyLabel}>Nhóm</Text>
            <Text style={styles.propertyValue}>{element.group || "N/A"}</Text>
          </View>

          <View style={styles.propertyItem}>
            <View style={styles.propertyIconContainer}>
              <MaterialCommunityIcons name="layers" size={24} color={colors.primary} />
            </View>
            <Text style={styles.propertyLabel}>Chu kỳ</Text>
            <Text style={styles.propertyValue}>{element.period}</Text>
          </View>
        </View>

        <View style={styles.propertyRow}>
          <View style={styles.propertyItem}>
            <View style={styles.propertyIconContainer}>
              <MaterialCommunityIcons name="cube-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.propertyLabel}>Khối</Text>
            <Text style={styles.propertyValue}>{element.block}</Text>
          </View>

          <View style={styles.propertyItem}>
            <View style={styles.propertyIconContainer}>
              <MaterialCommunityIcons name="shape-outline" size={24} color={colors.primary} />
            </View>
            <Text style={styles.propertyLabel}>Loại</Text>
            <Text style={styles.propertyValue}>{element.type}</Text>
          </View>
        </View>
      </View>

      {/* Reusable Comment Section */}
      <View style={styles.commentSectionContainer}>
        <CommentSection itemId={elementId} itemType="element" loggedInUsername={loggedInUsername} />
      </View>
    </ScrollView>
  )
}

// Enhanced color palette
const colors = {
  primary: "#007AFF",
  secondary: "#5856D6",
  background: "#F2F2F7",
  cardBackground: "#FFFFFF",
  textPrimary: "#000000",
  textSecondary: "#6E6E73",
  textLight: "#FFFFFF",
  divider: "#E5E5EA",
  favoriteActive: "#FF3B30",
  favoriteInactive: "#AEAEB2",
  shadow: "rgba(0, 0, 0, 0.1)",
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.favoriteActive,
  },

  // Element Card Styles
  elementCardContainer: {
    padding: 16,
    marginBottom: 8,
  },
  elementCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  elementCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  atomicNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  elementSymbolContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  elementSymbol: {
    fontSize: 72,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  elementName: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  elementCategory: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.9,
  },

  // Properties Styles
  propertiesContainer: {
    backgroundColor: colors.cardBackground,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  propertyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  propertyItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 4,
  },
  propertyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  propertyLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    textAlign: "center",
  },
  propertyValue: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },

  // Comment Section
  commentSectionContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Misc
  disabledIcon: {
    opacity: 0.4,
  },
})
