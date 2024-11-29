import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons'; 

const EscolhaPedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nomePedido, setNomePedido] = useState('');
  const [ingredientesPedido, setIngredientesPedido] = useState([]);
  const [ingredienteNome, setIngredienteNome] = useState('');
  const [ingredienteQuantidade, setIngredienteQuantidade] = useState('');
  const [valorTotalPedido, setValorTotalPedido] = useState('');

  //Url gerada pelo ngrok
  const apiURL = 'https://d057-2804-29b8-50ee-3dad-ac32-984-ff32-ec6a.ngrok-free.app/api/pedidos'; 
  const addPedidoURL = 'https://d057-2804-29b8-50ee-3dad-ac32-984-ff32-ec6a.ngrok-free.app/api/pedidoAdd';
  const historicoAddURL = 'https://d057-2804-29b8-50ee-3dad-ac32-984-ff32-ec6a.ngrok-free.app/api/historicoAdd'; 
 

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await axios.get(apiURL);
        setPedidos(response.data);
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error.message);
      }
    };

    fetchPedidos();
    const intervalId = setInterval(fetchPedidos, 5000); // Atualiza a lista a cada 5 segundos

    return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  }, []);

  const handleAddIngrediente = () => {
    if (ingredienteNome && ingredienteQuantidade) {
      setIngredientesPedido([
        ...ingredientesPedido,
        { nome: ingredienteNome.trim(), quantidade: parseInt(ingredienteQuantidade) },
      ]);
      setIngredienteNome('');
      setIngredienteQuantidade('');
    }
  };

  const handleAddPedido = async () => {
    if (!nomePedido || ingredientesPedido.length === 0 || !valorTotalPedido) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos antes de salvar o pedido.');
      return;
    }

    try {
      const novoPedido = {
        nome: nomePedido,
        ingredientes: ingredientesPedido,
        valor_total: parseFloat(valorTotalPedido),
      };

      const response = await axios.post(addPedidoURL, novoPedido);
      setPedidos([...pedidos, response.data]);
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao adicionar o pedido:', error.message);
    }
  };


  const handleChoosePedido = async (pedido) => {
    Alert.alert(
      'Confirmação',
      `Você deseja escolher o pedido "${pedido.nome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const pedidoHistorico = {
              ...pedido,
              status: 'Em andamento',
              dataEscolha: new Date(),
              valor_gasto: 0,
            };

            await axios.post(historicoAddURL, pedidoHistorico);
            Alert.alert('Sucesso', 'Pedido adicionado ao histórico.');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setNomePedido('');
    setIngredientesPedido([]);
    setValorTotalPedido('');
    setIngredienteNome('');
    setIngredienteQuantidade('');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          resetForm();
          setModalVisible(true);
        }}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {pedidos.length === 0 ? (
        <Text style={styles.loadingText}>Buscando pedidos...</Text>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <TouchableOpacity onPress={() => handleChoosePedido(item)}>
                <Image source={require('../img/burg.png')} style={styles.icon} />
                <Text style={styles.itemName}>{item.nome}</Text>
                <Text style={styles.itemValue}>
                  {`R$ ${item.valor_total.toFixed(2)}`}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Novo Pedido</Text>
          <TextInput
            placeholder="Nome do Pedido"
            value={nomePedido}
            onChangeText={setNomePedido}
            style={styles.input}
          />
          <Text style={styles.modalSubtitle}>Adicionar Ingrediente</Text>
          <TextInput
            placeholder="Nome do Ingrediente"
            value={ingredienteNome}
            onChangeText={setIngredienteNome}
            style={styles.input}
          />
          <TextInput
            placeholder="Quantidade"
            value={ingredienteQuantidade}
            onChangeText={setIngredienteQuantidade}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button title="Adicionar Ingrediente" onPress={handleAddIngrediente} color='#bf840d' />
          <Text style={styles.modalSubtitle}>Ingredientes Adicionados:</Text>
          {ingredientesPedido.map((ingrediente, index) => (
            <Text key={index} style={styles.ingredienteText}>
              {`${ingrediente.nome} - ${ingrediente.quantidade}`}
            </Text>
          ))}
          <TextInput
            placeholder="Valor Total"
            value={valorTotalPedido}
            onChangeText={setValorTotalPedido}
            keyboardType="numeric"
            style={styles.input}
          />
          <Button title="Salvar Pedido" onPress={handleAddPedido} color='#bf840d' />
          <Button title="Cancelar" onPress={() => setModalVisible(false)} color="red" />
        </View>
      </Modal>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#cf9415',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#888',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  itemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  ingredienteText: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    padding: 8,
  },
});

export default EscolhaPedidos;