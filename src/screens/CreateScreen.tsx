import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Modal,
} from 'react-native';

const PARAMETERS = [
  {
    category: 'Basic',
    items: [
      'Market Cap',
      'Current Price',
      'P/E',
      'Book Value',
      'Dividend Yield',
      'ROCE',
      'ROE',
    ]
  },
  {
    category: 'Growth',
    items: [
      'Sales Growth 3Y',
      'Profit Growth 3Y',
      'Sales Growth TTM',
      'Profit Growth TTM',
    ]
  },
  {
    category: 'Quality',
    items: [
      'Promoter Holding',
      'Debt to Equity',
      'Current Ratio',
      'Interest Coverage',
      'Profit Margin',
    ]
  }
];

const OPERATORS = ['>', '<', '=', '>=', '<='];

const CreateScreen = () => {
  const [screenName, setScreenName] = useState('');
  const [conditions, setConditions] = useState([
    { parameter: '', operator: '>', value: '' }
  ]);
  const [showOperatorModal, setShowOperatorModal] = useState(false);
  const [selectedConditionIndex, setSelectedConditionIndex] = useState(0);

  const addCondition = () => {
    setConditions([...conditions, { parameter: '', operator: '>', value: '' }]);
  };

  const updateCondition = (index: number, field: string, value: string) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index));
    }
  };

  const showOperatorSelection = (index: number) => {
    setSelectedConditionIndex(index);
    setShowOperatorModal(true);
  };

  const selectOperator = (operator: string) => {
    updateCondition(selectedConditionIndex, 'operator', operator);
    setShowOperatorModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Screen</Text>
        <TouchableOpacity style={styles.runButton}>
          <Text style={styles.runButtonText}>RUN</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.nameSection}>
          <Text style={styles.label}>Screen Name</Text>
          <TextInput
            style={styles.nameInput}
            value={screenName}
            onChangeText={setScreenName}
            placeholder="Enter screen name"
            placeholderTextColor="#666666"
          />
        </View>

        <View style={styles.conditionsSection}>
          <Text style={styles.sectionTitle}>Conditions</Text>
          
          {conditions.map((condition, index) => (
            <View key={index} style={styles.conditionRow}>
              <TouchableOpacity 
                style={styles.parameterSelect}
                onPress={() => {/* Show parameter modal */}}
              >
                <Text style={styles.selectText}>
                  {condition.parameter || 'Select Parameter'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.operatorSelect}
                onPress={() => showOperatorSelection(index)}
              >
                <Text style={styles.selectText}>
                  {condition.operator}
                </Text>
              </TouchableOpacity>

              <TextInput
                style={styles.valueInput}
                value={condition.value}
                onChangeText={(value) => updateCondition(index, 'value', value)}
                placeholder="Value"
                placeholderTextColor="#666666"
                keyboardType="numeric"
              />

              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => removeCondition(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.addButton}
            onPress={addCondition}
          >
            <Text style={styles.addButtonText}>+ Add Condition</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.parametersSection}>
          <Text style={styles.sectionTitle}>Available Parameters</Text>
          {PARAMETERS.map((category, index) => (
            <View key={index} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>{category.category}</Text>
              <View style={styles.parametersList}>
                {category.items.map((item, itemIndex) => (
                  <TouchableOpacity 
                    key={itemIndex}
                    style={styles.parameterItem}
                    onPress={() => {
                      if (conditions.length > 0) {
                        updateCondition(conditions.length - 1, 'parameter', item);
                      }
                    }}
                  >
                    <Text style={styles.parameterText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={showOperatorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOperatorModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowOperatorModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Operator</Text>
            {OPERATORS.map((operator, index) => (
              <TouchableOpacity
                key={index}
                style={styles.operatorOption}
                onPress={() => selectOperator(operator)}
              >
                <Text style={styles.operatorText}>{operator}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  runButton: {
    backgroundColor: '#00FF7F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  runButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  nameSection: {
    marginBottom: 24,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  conditionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  parameterSelect: {
    flex: 2,
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  operatorSelect: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  selectText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  valueInput: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 16,
    marginRight: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#333333',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
  },
  addButton: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#00FF7F',
    fontSize: 16,
    fontWeight: 'bold',
  },
  parametersSection: {
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    color: '#666666',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  parametersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  parameterItem: {
    backgroundColor: '#1A1A1A',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 8,
  },
  parameterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  operatorOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  operatorText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CreateScreen; 