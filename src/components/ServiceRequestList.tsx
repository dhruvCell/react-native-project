import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  RefreshControl,
  Dimensions 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

interface ServiceRequest {
  _id: string;
  serviceName: string;
  customerName: string;
  phone: string;
  email: string;
  companyName: string;
  scheduledDateTime: string;
  assignedTo: string;
  status: string;
  createdAt: string;
}

const ServiceRequestList = () => {
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handleServiceRequestPress = (serviceRequest: ServiceRequest) => {
    (navigation as any).navigate('ServiceRequestDetails', { serviceRequest });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#28a745';
      case 'in progress':
        return '#17a2b8';
      case 'pending':
        return '#ffc107';
      case 'cancelled':
        return '#dc3545';
      case 'on hold':
        return '#6c757d';
      default:
        return '#007bff';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'check-circle';
      case 'in progress':
        return 'timer';
      case 'pending':
        return 'schedule';
      case 'cancelled':
        return 'cancel';
      case 'on hold':
        return 'pause-circle-filled';
      default:
        return 'assignment';
    }
  };

  const fetchServiceRequests = async () => {
    if (!user || !token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const response = await fetch('http://10.0.2.2:3002/api/service-requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setServiceRequests(data);
    } catch (error) {
      console.error('Error fetching service requests:', error);
      Alert.alert('Error', 'Failed to fetch service requests. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchServiceRequests();
  }, []);

  useEffect(() => {
    fetchServiceRequests();
  }, [user, token]);

  // Refresh service requests when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchServiceRequests();
    }, [fetchServiceRequests])
  );

  const renderItem = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity 
      style={[
        styles.fullWidthItem, 
        { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }
      ]} 
      onPress={() => handleServiceRequestPress(item)}
    >
      <View style={styles.itemHeader}>
        <View style={styles.serviceInfo}>
          <Icon name="assignment" size={20} color={colors.primary} style={styles.serviceIcon} />
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.serviceName}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Icon 
            name={getStatusIcon(item.status)} 
            size={14} 
            color="#fff" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailColumn}>
            <View style={styles.detailItem}>
              <Icon name="person" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Customer:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
                {item.customerName}
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Icon name="business" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Company:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
                {item.companyName}
              </Text>
            </View>
          </View>
          
          <View style={styles.detailColumn}>
            <View style={styles.detailItem}>
              <Icon name="engineering" size={16} color={colors.textSecondary} />
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Assigned To:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]} numberOfLines={1}>
                {item.assignedTo}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="access-time" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Scheduled:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(item.scheduledDateTime).toLocaleString()}
            </Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="event" size={16} color={colors.textSecondary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Created:</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading service requests...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Service Requests ({serviceRequests.length})
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Manage your service requests
        </Text>
      </View>

      <FlatList
        data={serviceRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="assignment" size={64} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No service requests found
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
              Create your first service request to get started
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  fullWidthItem: {
    width: '100%',
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginLeft: 8,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailColumn: {
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 12,
    marginLeft: 6,
    marginRight: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '400',
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ServiceRequestList;