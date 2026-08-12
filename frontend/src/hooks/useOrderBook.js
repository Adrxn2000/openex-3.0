import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export function useOrderBook() {
  const [orderBook, setOrderBook] = useState({ bestBid: 0, bestAsk: 0 });

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        client.subscribe('/topic/orderbook', (message) => {
          setOrderBook(JSON.parse(message.body));
        });
      },
    });
    client.activate();
    return () => client.deactivate();
  }, []);

  return orderBook;
}