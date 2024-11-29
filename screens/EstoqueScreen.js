import React, { useState, useCallback } from 'react';
import { View, TextInput, Button, Text, Alert, FlatList, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons'; // Importação do ícone de lixeira

const apiURL = 'https://d057-2804-29b8-50ee-3dad-ac32-984-ff32-ec6a.ngrok-free.app/api/estoque';

const EstoqueScreen = () => {
  const [ingredientes, setIngredientes] = useState([]);
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidadePadrao, setQuantidadePadrao] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchIngredientes = async () => {
    try {
      const response = await axios.get(apiURL);
      setIngredientes(response.data);
    } catch (error) {
      console.error('Erro ao buscar ingredientes do estoque:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchIngredientes();
    }, [])
  );

  const handleSaveEstoque = async () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'O nome do ingrediente é obrigatório!');
      return;
    }

    try {
      const ingrediente = {
        nome,
        quantidade: parseInt(quantidade) || 0,
        preco: parseFloat(preco) || 0,
        quantidade_padrao: parseInt(quantidadePadrao) || 0,
      };

      if (editingId) {
        await axios.put(`${apiURL}/${editingId}`, ingrediente);
        Alert.alert('Sucesso', 'Ingrediente atualizado no estoque!');
      } else {
        await axios.post('https://d057-2804-29b8-50ee-3dad-ac32-984-ff32-ec6a.ngrok-free.app/api/estoqueAdd', ingrediente);
        Alert.alert('Sucesso', 'Ingrediente adicionado ao estoque!');
      }

      setNome('');
      setQuantidade('');
      setPreco('');
      setQuantidadePadrao('');
      setEditingId(null);
      fetchIngredientes();
    } catch (error) {
      console.error('Erro ao salvar ingrediente no estoque:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiURL}/${id}`);
      Alert.alert('Sucesso', 'Ingrediente removido do estoque!');
      fetchIngredientes();
    } catch (error) {
      console.error('Erro ao deletar ingrediente:', error);
      Alert.alert('Erro', 'Não foi possível deletar o ingrediente.');
    }
  };

  const handleEdit = (ingrediente) => {
    setNome(ingrediente.nome);
    setQuantidade(ingrediente.quantidade.toString());
    setPreco(ingrediente.preco.toString());
    setQuantidadePadrao(ingrediente.quantidade_padrao?.toString() || '');
    setEditingId(ingrediente._id);
  };

  const renderIngrediente = ({ item }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
      }}
    >
      <TouchableOpacity
        onPress={() => handleEdit(item)}
        style={{ flex: 1, marginRight: 10 }}
      >
        <Text style={{ fontWeight: 'bold' }}>{item.nome}</Text>
        <Text>Quantidade: {item.quantidade}</Text>
        <Text>Quantidade Padrão: {item.quantidade_padrao || 'N/A'}</Text>
        <Text>Preço: R$ {item.preco.toFixed(2)}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() =>
          Alert.alert(
            'Confirmar Exclusão',
            `Deseja realmente excluir o ingrediente "${item.nome}"?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Excluir', onPress: () => handleDelete(item._id) },
            ]
          )
        }
      >
        <MaterialIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <FlatList
        data={ingredientes}
        keyExtractor={(item) => item._id}
        renderItem={renderIngrediente}
        ListHeaderComponent={<Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>Estoque</Text>}
        ListEmptyComponent={<Text>Nenhum ingrediente no estoque.</Text>}
      />

      <Text style={{ marginTop: 20 }}>Nome do Ingrediente:</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        placeholder="Nome do ingrediente"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Quantidade:</Text>
      <TextInput
        value={quantidade}
        onChangeText={setQuantidade}
        placeholder="Quantidade"
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Quantidade Padrão:</Text>
      <TextInput
        value={quantidadePadrao}
        onChangeText={setQuantidadePadrao}
        placeholder="Quantidade padrão"
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Text>Preço da quantidade padrão:</Text>
      <TextInput
        value={preco}
        onChangeText={setPreco}
        placeholder="Preço por quantidade padrão"
        keyboardType="numeric"
        style={{ borderBottomWidth: 1, marginBottom: 10 }}
      />

      <Button
        title={editingId ? 'Atualizar Ingrediente' : 'Adicionar ao Estoque'}
        onPress={handleSaveEstoque}
        color="#bf840d"
      />
    </View>
  );
};

export default EstoqueScreen;
