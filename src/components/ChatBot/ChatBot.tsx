import * as React from 'react';
import styles from './ChatBot.module.scss'; // Ensure your styles are correctly configured

interface IChatBotProps {
    isOpen: boolean;
    onToggleChat: () => void;
}

interface IChatBotState {
    messages: { type: string, content: string }[];
    userInput: string;
}

export default class ChatBot extends React.Component<IChatBotProps, IChatBotState> {
    constructor(props: IChatBotProps) {
        super(props);
        this.state = {
            messages: [],
            userInput: ''
        };
    }

    handleUserInput = (event: React.ChangeEvent<HTMLInputElement>): void => {
        this.setState({ userInput: event.target.value });
    };

    sendMessage = (): void => {
        const newMessage = { type: 'user', content: this.state.userInput };
        this.setState(prevState => ({
            messages: [...prevState.messages, newMessage],
            userInput: ''
        }));
        // Here, add logic to send message to backend or service
    };

    render() {
        if (!this.props.isOpen) return null;

        return (
            <div className={styles.chatBot}>
                <div className={styles.chatWindow}>
                    <div className={styles.messages}>
                        {this.state.messages.map((msg, index) => (
                            <div key={index} className={msg.type === 'user' ? styles.userMessage : styles.botMessage}>
                                {msg.content}
                            </div>
                        ))}
                    </div>
                    <input type="text" value={this.state.userInput} onChange={this.handleUserInput} />
                    <button onClick={this.sendMessage}>Send</button>
                </div>
                <button onClick={this.props.onToggleChat}>Close Chat</button>
            </div>
        );
    }
}
