import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Importação do useFocusEffect
import axios from 'axios';

const HistoricoPedidos = () => {
  const [historico, setHistorico] = useState([]);
  const [valorTotalGasto, setValorTotalGasto] = useState(0);
  const [valorTotalRecebido, setValorTotalRecebido] = useState(0);
  const apiURL = 'https://d057-2804-29b8-50ee-3dad-ac32-984-ff32-ec6a.ngrok-free.app/api/historico';

  const fetchHistorico = async () => {
    try {
      const response = await axios.get(`${apiURL}?ultimoSeteDias=true`);
      const data = response.data;

      // Ordenar os pedidos com "Em andamento" primeiro
      data.sort((a, b) => {
        if (a.status === 'Em andamento') return -1;
        if (b.status === 'Em andamento') return 1;
        return 0;
      });

      setHistorico(data);

      // Calcular o valor total gasto
      const totalGasto = data.reduce((sum, pedido) => sum + (pedido.valor_gasto || 0), 0);
      setValorTotalGasto(totalGasto);

      // Calcular o valor total recebido (assumindo que 'valor_total' existe no pedido)
      const totalRecebido = data.reduce((sum, pedido) => sum + (pedido.valor_total || 0), 0);
      setValorTotalRecebido(totalRecebido);
    } catch (error) {
      console.error("Erro ao buscar histórico de pedidos:", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchHistorico();
    }, [])
  );

  const handleStatusChange = async (pedido, novoStatus) => {
    try {
      let valorGasto = pedido.valor_gasto || 0;

      if (novoStatus === "Concluído") {
        for (const ingrediente of pedido.ingredientes) {
          await axios.post('https://d057-2804-29b8-50ee-3dad-ac32-984-ff32-ec6a.ngrok-free.app/api/estoque/deduzir-ingrediente', {
            nome: ingrediente.nome.trim(), // Remover possíveis espaços desnecessários
            quantidade: ingrediente.quantidade,
          });

          const estoque = await axios.get(
            `https://d057-2804-29b8-50ee-3dad-ac32-984-ff32-ec6a.ngrok-free.app/api/estoque/nome/${ingrediente.nome}`
          );
          if (!estoque.data || estoque.data.length === 0) {
            console.error(`Ingrediente ${ingrediente.nome} não encontrado no estoque!`);
            throw new Error(`Ingrediente ${ingrediente.nome} não encontrado no estoque!`);
          }

          const { quantidade_padrao, preco } = estoque.data[0];
          valorGasto += (ingrediente.quantidade * preco) / quantidade_padrao;
        }
      }

      const response = await axios.put(
        `https://d057-2804-29b8-50ee-3dad-ac32-984-ff32-ec6a.ngrok-free.app/api/historico/${pedido._id}`,
        {
          status: novoStatus,
          valor_gasto: valorGasto,
        }
      );

      Alert.alert("Sucesso", `Status atualizado para '${novoStatus}'!`);
      fetchHistorico(); // Atualiza a lista de pedidos após a alteração
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error.response?.data || error.message);
      Alert.alert("Erro", error.response?.data || error.message);
    }
  };

  const handlePressPedido = (pedido) => {
    Alert.alert(
      "Alterar Status",
      `Selecione o novo status para o pedido "${pedido.nome}"`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Concluído",
          onPress: () => handleStatusChange(pedido, "Concluído"),
        },
        {
          text: "Cancelado",
          onPress: () => handleStatusChange(pedido, "Cancelado"),
        },
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Em andamento':
        return styles.statusEmAndamento;
      case 'Concluído':
        return styles.statusConcluido;
      case 'Cancelado':
        return styles.statusCancelado;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Gasto: R$ {valorTotalGasto.toFixed(2)}</Text>
        <Text style={styles.headerText}>Recebido: R$ {valorTotalRecebido.toFixed(2)}</Text>
      </View>

      <FlatList
        data={historico}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => handlePressPedido(item)}
          >
            <Text style={styles.itemName}>{item.nome}</Text>
            <Text style={[styles.itemValue, getStatusStyle(item.status)]}>Status: {item.status}</Text>
            <Text style={styles.itemValue}>
              Gasto: R$ {item.valor_gasto ? item.valor_gasto.toFixed(2) : '0.00'}
            </Text>
            <Text style={styles.itemValue}>
              Data: {item.dataEscolha ? new Date(item.dataEscolha).toLocaleDateString('pt-BR') : 'N/A'}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemValue: {
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusEmAndamento: {
    color: 'orange',
  },
  statusConcluido: {
    color: 'green',
  },
  statusCancelado: {
    color: 'red',
  },
});

export default HistoricoPedidos;
