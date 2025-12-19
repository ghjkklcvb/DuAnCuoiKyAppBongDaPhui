import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { matchService } from '../../../services/match';
import MatchBackground from '../../../components/match/MatchBackground';

export default function EditMatchInfoScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = Colors;

  const { data: match } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchService.getMatchById(id as string),
  });

  const [scheduledDate, setScheduledDate] = useState('');
  const [venue, setVenue] = useState('');
  const [referee, setReferee] = useState('');
  const [notes, setNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (match) {
      setScheduledDate(match.scheduledDate ? new Date(match.scheduledDate).toISOString().slice(0, 16) : '');
      setVenue(match.venue || '');
      setReferee(match.referee || '');
      setNotes(match.notes || '');
    }
  }, [match]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => matchService.updateMatchInfo(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['league'] });
      Alert.alert('Thành công', 'Đã cập nhật thông tin trận đấu', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật');
    },
  });

  const handleSubmit = () => {
    const data: any = {};
    
    if (scheduledDate) data.scheduledDate = new Date(scheduledDate).toISOString();
    if (venue.trim()) data.venue = venue.trim();
    if (referee.trim()) data.referee = referee.trim();
    if (notes.trim()) data.notes = notes.trim();

    updateMutation.mutate(data);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      let hours = 0;
      let minutes = 0;
      
      if (scheduledDate) {
        const timePart = scheduledDate.includes('T') ? scheduledDate.split('T')[1] : '00:00';
        const [h, m] = timePart.split(':').map(Number);
        hours = h;
        minutes = m;
      }

      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const hoursStr = String(hours).padStart(2, '0');
      const minutesStr = String(minutes).padStart(2, '0');
      
      setScheduledDate(`${year}-${month}-${day}T${hoursStr}:${minutesStr}`);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;
      let day = new Date().getDate();
      
      if (scheduledDate) {
        const datePart = scheduledDate.includes('T') ? scheduledDate.split('T')[0] : scheduledDate;
        const [y, m, d] = datePart.split('-').map(Number);
        year = y;
        month = m;
        day = d;
      }

      const yearStr = String(year);
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const hoursStr = String(selectedTime.getHours()).padStart(2, '0');
      const minutesStr = String(selectedTime.getMinutes()).padStart(2, '0');
      
      setScheduledDate(`${yearStr}-${monthStr}-${dayStr}T${hoursStr}:${minutesStr}`);
    }
  };

  return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Cập nhật thông tin',
          headerStyle: { 
            backgroundColor: 'rgba(214, 18, 64, 1)',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
        }}
      />
      
      <MatchBackground>
        <ScrollView style={styles.container}>
        <View style={styles.form}>
          <Text style={[styles.label, { color: '#FFFFFF' }]}>Ngày giờ thi đấu</Text>
          
          <View style={styles.dateTimeRow}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={[styles.dateTimeButtonText, { color: scheduledDate ? '#1F2937' : '#9CA3AF' }]}>
                {scheduledDate ? new Date(scheduledDate).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : 'Chọn ngày'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
              <Text style={[styles.dateTimeButtonText, { color: scheduledDate ? '#1F2937' : '#9CA3AF' }]}>
                {scheduledDate ? new Date(scheduledDate).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Chọn giờ'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={scheduledDate ? new Date(scheduledDate) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={scheduledDate ? new Date(scheduledDate) : new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
            />
          )}

          <Text style={[styles.label, { color: '#FFFFFF' }]}>Sân đấu</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Sân Mỹ Đình"
            placeholderTextColor="#9CA3AF"
            value={venue}
            onChangeText={setVenue}
          />

          <Text style={[styles.label, { color: '#FFFFFF' }]}>Trọng tài</Text>
          <TextInput
            style={styles.input}
            placeholder="VD: Nguyễn Văn A"
            placeholderTextColor="#9CA3AF"
            value={referee}
            onChangeText={setReferee}
          />

          <Text style={[styles.label, { color: '#FFFFFF' }]}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ghi chú về trận đấu..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              updateMutation.isPending && styles.buttonDisabled
            ]}
            onPress={handleSubmit}
            disabled={updateMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
      </MatchBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(214, 18, 64, 0.2)',
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  hint: {
    fontSize: 12,
    marginTop: -15,
    marginBottom: 20,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(214, 18, 64, 0.2)',
  },
  dateTimeButtonText: {
    fontSize: 14,
    flex: 1,
  },
});