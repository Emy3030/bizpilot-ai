import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiApi } from '@/services/aiApi';
import { ChatMessage } from '@/types/ai';

const HISTORY_KEY = ['ai-chat-history'];

export function useAiChatHistory() {
  return useQuery({
    queryKey: HISTORY_KEY,
    queryFn: () => aiApi.getHistory(100),
  });
}

export function useSendAiMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => aiApi.sendMessage(message),

    onMutate: async (message: string) => {
      await queryClient.cancelQueries({ queryKey: HISTORY_KEY });
      const previous = queryClient.getQueryData<ChatMessage[]>(HISTORY_KEY) || [];

      const optimisticUserMessage: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        role: 'USER',
        content: message,
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatMessage[]>(HISTORY_KEY, [...previous, optimisticUserMessage]);
      return { previous };
    },

    onSuccess: (result) => {
      queryClient.setQueryData<ChatMessage[]>(HISTORY_KEY, (current) => [
        ...(current || []),
        {
          id: `assistant-${Date.now()}`,
          role: 'ASSISTANT',
          content: result.reply,
          createdAt: result.createdAt,
          actionsPerformed: result.actionsPerformed,
        },
      ]);
    },

    onError: (_err, _message, context) => {
      if (context?.previous) {
        queryClient.setQueryData(HISTORY_KEY, context.previous);
      }
    },
  });
}

export function useClearAiChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => aiApi.clearHistory(),
    onSuccess: () => {
      queryClient.setQueryData<ChatMessage[]>(HISTORY_KEY, []);
    },
  });
}
