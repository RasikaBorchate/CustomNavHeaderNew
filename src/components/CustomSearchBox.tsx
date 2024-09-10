import * as React from 'react';
import styles from './CustomSearchBox.module.scss';
import { Search20Regular } from '@fluentui/react-icons';

interface ICustomSearchBoxProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
}

interface ICustomSearchBoxState {
  searchTerm: string;
  isExpanded: boolean;
}

class CustomSearchBox extends React.Component<ICustomSearchBoxProps, ICustomSearchBoxState> {
  constructor(props: ICustomSearchBoxProps) {
    super(props);
    this.state = {
      searchTerm: '',
      isExpanded: false,
    };
  }

  handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleSearch = () => {
    this.props.onSearch(this.state.searchTerm);
  };

  toggleExpand = () => {
    this.setState((prevState) => ({
      isExpanded: !prevState.isExpanded,
    }));
  };

  render() {
    return (
      <div className={styles.searchBoxContainer}>
        {this.state.isExpanded && (
          <input
            type="text"
            placeholder={this.props.placeholder}
            value={this.state.searchTerm}
            onChange={this.handleSearchChange}
            className={styles.searchInput}
            onBlur={this.toggleExpand}
          />
        )}
        <Search20Regular
          className={styles.searchIcon}
          onClick={this.toggleExpand}
          onMouseDown={this.handleSearch}
        />
      </div>
    );
  }
}

export default CustomSearchBox;
