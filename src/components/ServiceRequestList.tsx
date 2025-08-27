import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

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
  const navigation = useNavigation();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const handleServiceRequestPress = (serviceRequest: ServiceRequest) => {
    (navigation as any).navigate('ServiceRequestDetails', { serviceRequest });
  };

  const fetchServiceRequests = async () => {
    if (!user || !token) {
      setLoading(false);
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
    }
  };

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
    <TouchableOpacity style={styles.item} onPress={() => handleServiceRequestPress(item)}>
      <Text style={styles.title}>{item.serviceName}</Text>
      <Text style={styles.customer}>{item.customerName}</Text>
      <Text style={styles.company}>{item.companyName}</Text>
      <Text style={styles.datetime}>
        Scheduled: {new Date(item.scheduledDateTime).toLocaleString()}
      </Text>
      <Text style={styles.status}>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading service requests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={serviceRequests}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No service requests found</Text>
          </View>
        }
        refreshing={loading}
        onRefresh={fetchServiceRequests}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  item: {
    padding: 16,
    marginVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customer: {
    fontSize: 16,
    marginBottom: 2,
  },
  company: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  datetime: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
});

export default ServiceRequestList;
