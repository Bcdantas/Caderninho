import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Customer } from '../types';

const HistoryList: React.FC = () => {
    const { orders, customers, getCustomerById, getProductById } = useApp();
    const [filterDate, setFilterDate] = useState('');
    const [filterCustomerId, setFilterCustomerId] = useState('');

    const paidOrders = useMemo(() => {
        return orders
            .filter(order => order.isPaid)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return paidOrders.filter(order => {
            const dateMatch = filterDate ? order.date.startsWith(filterDate) : true;
            const customerMatch = filterCustomerId ? order.customerId === filterCustomerId : true;
            return dateMatch && customerMatch;
        });
    }, [paidOrders, filterDate, filterCustomerId]);

    const totalSales = useMemo(() => {
        return filteredOrders.reduce((sum, order) => sum + order.total, 0);
    }, [filteredOrders]);

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Histórico de Vendas</h2>
                <p className="text-slate-500">Aqui estão todos os pedidos que já foram pagos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-xl shadow-sm border mb-6">
                <div className="md:col-span-1">
                    <label htmlFor="dateFilter" className="block text-sm font-medium text-slate-700 mb-1">Filtrar por data</label>
                    <input
                        type="date"
                        id="dateFilter"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="customerFilter" className="block text-sm font-medium text-slate-700 mb-1">Filtrar por cliente</label>
                    <select
                        id="customerFilter"
                        value={filterCustomerId}
                        onChange={e => setFilterCustomerId(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                    >
                        <option value="">Todos os clientes</option>
                        {customers.map((c: Customer) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="p-4 bg-indigo-50 rounded-xl mb-6 text-indigo-900">
                <span className="font-semibold">Total vendido (nos filtros):</span>
                <span className="text-2xl font-bold ml-2">{formatCurrency(totalSales)}</span>
            </div>

            <div className="space-y-4">
                {filteredOrders.length > 0 ? filteredOrders.map(order => {
                    const customer = order.customerId ? getCustomerById(order.customerId) : null;
                    return (
                        <div key={order.id} className="bg-white rounded-xl shadow-sm p-5 border border-slate-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold text-lg text-slate-800">{customer ? customer.name : 'Cliente Anônimo'}</p>
                                    <p className="text-sm text-slate-500">{formatDate(order.date)}</p>
                                </div>
                                <p className="font-bold text-lg text-emerald-600">{formatCurrency(order.total)}</p>
                            </div>
                            <div className="space-y-1 bg-slate-50 p-3 rounded-md">
                                {order.items.map((item, index) => {
                                    const product = getProductById(item.productId);
                                    return (
                                        <div key={index} className="flex justify-between text-sm text-slate-600">
                                            <span>{item.quantity}x {product?.name || 'Produto Removido'}</span>
                                            <span>{formatCurrency(item.quantity * (product?.price || 0))}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                }) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
                        <p className="text-slate-600">Nenhuma venda encontrada para os filtros selecionados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HistoryList;