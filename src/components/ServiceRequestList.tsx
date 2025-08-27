import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
        styles.item, 
        { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.text,
          elevation: 2,
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

      <View style={styles.customerInfo}>
        <Icon name="person" size={16} color={colors.textSecondary} />
        <Text style={[styles.customer, { color: colors.text }]} numberOfLines={1}>
          {item.customerName}
        </Text>
      </View>

      <View style={styles.companyInfo}>
        <Icon name="business" size={16} color={colors.textSecondary} />
        <Text style={[styles.company, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.companyName}
        </Text>
      </View>

      <View style={styles.datetimeInfo}>
        <Icon name="access-time" size={16} color={colors.textSecondary} />
        <Text style={[styles.datetime, { color: colors.textSecondary }]}>
          {new Date(item.scheduledDateTime).toLocaleString()}
        </Text>
      </View>

      <View style={styles.assignedInfo}>
        <Icon name="engineering" size={16} color={colors.textSecondary} />
        <Text style={[styles.assignedTo, { color: colors.textSecondary }]} numberOfLines={1}>
          Assigned to: {item.assignedTo}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.createdAt, { color: colors.textSecondary }]}>
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Icon name="chevron-right" size={20} color={colors.textSecondary} />
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
    padding: 16,
    paddingTop: 0,
  },
  item: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  customer: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  company: {
    fontSize: 14,
    marginLeft: 8,
  },
  datetimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  datetime: {
    fontSize: 14,
    marginLeft: 8,
  },
  assignedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  assignedTo: {
    fontSize: 14,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  createdAt: {
    fontSize: 12,
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
