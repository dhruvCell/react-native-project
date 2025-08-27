import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';

interface ServiceRequest {
  id: number;
  serviceName: string;
  customerName: string;
  phone: string;
  email: string;
  companyName: string;
  scheduledDateTime: string;
  assignedTo: string;
  status: string;
}

const ServiceRequestList = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const handleServiceRequestPress = (serviceRequest: ServiceRequest) => {
    (navigation as any).navigate('ServiceRequestDetails', { serviceRequest });
  };

  useEffect(() => {
    const fetchServiceRequests = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Mock data for now - replace with actual API call
        const mockData: ServiceRequest[] = [
          {
            id: 1,
            serviceName: 'AC Repair',
            customerName: 'John Doe',
            phone: '555-1234',
            email: 'john@example.com',
            companyName: 'ABC Corp',
            scheduledDateTime: '2024-01-15 10:00',
            assignedTo: 'Tech Smith',
            status: 'Pending'
          },
          {
            id: 2,
            serviceName: 'Plumbing Service',
            customerName: 'Jane Smith',
            phone: '555-5678',
            email: 'jane@example.com',
            companyName: 'XYZ Inc',
            scheduledDateTime: '2024-01-16 14:30',
            assignedTo: 'Plumber Joe',
            status: 'In Progress'
          }
        ];
        
        setServiceRequests(mockData);
      } catch (error) {
        console.error('Error fetching service requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceRequests();
  }, [user]);

  const renderItem = ({ item }: { item: ServiceRequest }) => (
    <TouchableOpacity style={styles.item} onPress={() => handleServiceRequestPress(item)}>
      <Text style={styles.title}>{item.serviceName}</Text>
      <Text style={styles.customer}>{item.customerName}</Text>
      <Text style={styles.company}>{item.companyName}</Text>
      <Text style={styles.datetime}>Scheduled: {item.scheduledDateTime}</Text>
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
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No service requests found</Text>
          </View>
        }
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
