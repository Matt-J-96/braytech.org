import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import cx from 'classnames';

import manifest from '../../utils/manifest';
import ObservedImage from '../../components/ObservedImage';

import './styles.css';

class Items extends React.Component {
  constructor(props) {
    super(props);

    this.scrollToRecordRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.highlight && this.scrollToRecordRef.current !== null) {
      window.scrollTo({
        top: this.scrollToRecordRef.current.offsetTop + this.scrollToRecordRef.current.offsetHeight / 2 - window.innerHeight / 2
      });
    }
  }

  render() {
    const { t, member, items, inspect } = this.props;

    let output = [];

    items.forEach((item, i) => {
      let definitionItem = manifest.DestinyInventoryItemDefinition[item.itemHash];

      output.push(
        <li
          key={i}
          className={cx({
            tooltip: !this.props.disableTooltip,
            linked: true
          })}
          data-hash={item.itemHash}
          data-instanceid={item.itemInstanceId}
          data-state={item.state}
        >
          <div className='icon'>
            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${definitionItem.displayProperties.icon}`} />
          </div>
          <div className='text'>
            <div className='name'>{definitionItem.displayProperties.name}</div>
          </div>
          {inspect && definitionItem.itemHash ? <Link to={{ pathname: `/inspect/${definitionItem.itemHash}`, state: { from: this.props.selfLinkFrom } }} /> : null}
        </li>
      );
    });
    

    return output;
  }
}

function mapStateToProps(state, ownProps) {
  return {
    member: state.member
  };
}

export default connect(mapStateToProps)(Items);
