import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ApiService, Category } from '../../services/apiService';

// Fallback BlurView component for compatibility
const BlurView = ({ children, style }: any) => {
  return (
    <View style={[style, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
      {children}
    </View>
  );
};

const { width, height } = Dimensions.get('window');

export default function CategoriesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await ApiService.getAllCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        console.error('Failed to load categories:', response.error);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleViewCategory = (categoryName: string) => {
    Alert.alert(
      categoryName,
      'This category contains various astrology services. You can book consultations with our expert astrologers.',
      [
        { text: 'Book Consultation', onPress: () => console.log('Navigate to booking') },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('vedic') || name.includes('astrology')) return '🌟';
    if (name.includes('tarot')) return '🔮';
    if (name.includes('numerology')) return '🔢';
    if (name.includes('palmistry')) return '✋';
    if (name.includes('love') || name.includes('relationship')) return '💕';
    if (name.includes('career')) return '💼';
    if (name.includes('health')) return '🏥';
    if (name.includes('gemstone')) return '💎';
    return '📂';
  };

  const getCategoryColor = (index: number) => {
    const colors = ['#0052CC', '#9B59B6', '#3498DB', '#E74C3C', '#FF8C42', '#1ABC9C', '#E67E22', '#2ECC71'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading Categories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.cosmicBackground}>
        <LinearGradient
          colors={['#0B1426', '#1A0B3D', '#2D1B69', '#0B1426']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.cosmicGradient}
        />

        <LinearGradient
          colors={['rgba(11,20,38,0.3)', 'rgba(26,11,61,0.6)', 'rgba(45,27,105,0.8)', 'rgba(11,20,38,0.9)']}
          locations={[0, 0.3, 0.7, 1]}
          style={styles.overlay}
        >
          <ScrollView 
            style={styles.scrollView} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#0052CC"
                colors={['#0052CC']}
              />
            }
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Categories</Text>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={handleRefresh}
              >
                <Text style={styles.refreshButtonText}>🔄</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Section */}
            <View style={styles.statsSection}>
              <BlurView style={styles.statsCard}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{categories.length}</Text>
                  <Text style={styles.statLabel}>Total Categories</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>
                    {categories.filter(cat => cat.description).length}
                  </Text>
                  <Text style={styles.statLabel}>With Descriptions</Text>
                </View>
              </BlurView>
            </View>

            {/* Categories Grid */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionTitle}>Service Categories</Text>
              
              <View style={styles.categoriesGrid}>
                {categories.map((category, index) => (
                  <View key={category.id} style={styles.categoryCard}>
                    <BlurView style={styles.categoryContent}>
                      <View style={styles.categoryHeader}>
                        <View style={[styles.categoryIconContainer, { backgroundColor: getCategoryColor(index) + '20' }]}>
                          <Text style={[styles.categoryIcon, { color: getCategoryColor(index) }]}>
                            {getCategoryIcon(category.name)}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.categoryName}>{category.name}</Text>
                      
                      {category.description && (
                        <Text style={styles.categoryDescription}>
                          {category.description}
                        </Text>
                      )}
                      
                      <View style={styles.categoryFooter}>
                        <TouchableOpacity 
                          style={styles.viewButton}
                          onPress={() => handleViewCategory(category.name)}
                        >
                          <LinearGradient
                            colors={[getCategoryColor(index), getCategoryColor(index) + 'CC']}
                            style={styles.viewButtonGradient}
                          >
                            <Text style={styles.viewButtonText}>View Services</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </BlurView>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.addSection}>
              <Text style={styles.sectionTitle}>Explore More</Text>
              
              <BlurView style={styles.actionCard}>
                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>🔮</Text>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Book Consultation</Text>
                    <Text style={styles.actionDescription}>Connect with expert astrologers</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <View style={styles.actionDivider} />

                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>📊</Text>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Daily Horoscope</Text>
                    <Text style={styles.actionDescription}>Get your personalized predictions</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>

                <View style={styles.actionDivider} />

                <TouchableOpacity style={styles.actionItem}>
                  <Text style={styles.actionIcon}>🌟</Text>
                  <View style={styles.actionContent}>
                    <Text style={styles.actionTitle}>Birth Chart</Text>
                    <Text style={styles.actionDescription}>Generate your complete kundli</Text>
                  </View>
                  <Text style={styles.actionArrow}>→</Text>
                </TouchableOpacity>
              </BlurView>
            </View>

            <View style={{ height: 100 }} />
          </ScrollView>
        </LinearGradient>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1426',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0B1426',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
  cosmicBackground: {
    flex: 1,
    width: width,
    height: height,
  },
  cosmicGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  scrollView: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 82, 204, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
  },

  // Stats
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0052CC',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },

  // Sections
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  addSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },

  // Categories
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 60) / 2,
    marginBottom: 16,
  },
  categoryContent: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 160,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 20,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
    marginBottom: 12,
    flex: 1,
  },
  categoryFooter: {
    marginTop: 'auto',
  },
  viewButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // Actions
  actionCard: {
    borderRadius: 20,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionArrow: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  actionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
});