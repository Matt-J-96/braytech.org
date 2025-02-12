import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import cx from 'classnames';

import manifest from '../../../utils/manifest';
import { ProfileLink, ProfileNavLink } from '../../../components/ProfileLink';
import ObservedImage from '../../../components/ObservedImage';
import Records from '../../../components/Records';
import { enumerateRecordState } from '../../../utils/destinyEnums';

class PresentationNode extends React.Component {
  render() {
    const { member, collectibles, primaryHash } = this.props;
    const characterId = member.characterId;
    const characterRecords = member.data.profile.characterRecords.data;
    const profileRecords = member.data.profile.profileRecords.data.records;

    let primaryDefinition = manifest.DestinyPresentationNodeDefinition[primaryHash];

    if (!primaryDefinition) {
      return null;
    }

    let secondaryHash = this.props.match.params.secondary ? this.props.match.params.secondary : primaryDefinition.children.presentationNodes[0].presentationNodeHash;
    let secondaryDefinition = manifest.DestinyPresentationNodeDefinition[secondaryHash];

    let tertiaryHash = this.props.match.params.tertiary ? this.props.match.params.tertiary : secondaryDefinition.children.presentationNodes[0].presentationNodeHash;
    let tertiaryDefinition = manifest.DestinyPresentationNodeDefinition[tertiaryHash];

    let quaternaryHash = this.props.match.params.quaternary ? this.props.match.params.quaternary : false;

    let primaryChildren = [];
    primaryDefinition.children.presentationNodes.forEach(child => {
      let node = manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash];

      let isActive = (match, location) => {
        if (this.props.match.params.secondary === undefined && primaryDefinition.children.presentationNodes.indexOf(child) === 0) {
          return true;
        } else if (match) {
          return true;
        } else {
          return false;
        }
      };

      primaryChildren.push(
        <li key={node.hash} className='linked'>
          <ProfileNavLink isActive={isActive} to={`/triumphs/${primaryHash}/${node.hash}`}>
            <ObservedImage className={cx('image', 'icon')} src={`https://www.bungie.net${node.displayProperties.icon}`} />
          </ProfileNavLink>
        </li>
      );
    });

    let secondaryChildren = [];
    secondaryDefinition.children.presentationNodes.forEach(child => {
      let node = manifest.DestinyPresentationNodeDefinition[child.presentationNodeHash];

      if (node.redacted) {
        return;
      }

      let states = [];

      node.children.records.forEach(r => {
        const definitionRecord = manifest.DestinyRecordDefinition[r.recordHash];
        const scopeRecord = definitionRecord.scope || 0;
        const dataRecord = scopeRecord === 1 ? characterRecords[characterId].records[definitionRecord.hash] : profileRecords[definitionRecord.hash];

        states.push(dataRecord)
      });

      let isActive = (match, location) => {
        if (this.props.match.params.tertiary === undefined && secondaryDefinition.children.presentationNodes.indexOf(child) === 0) {
          return true;
        } else if (match) {
          return true;
        } else {
          return false;
        }
      };

      let secondaryProgress = states.filter(record => enumerateRecordState(record.state).recordRedeemed).length
      let secondaryTotal = (collectibles && collectibles.hideInvisibleRecords) ? states.filter(record => !enumerateRecordState(record.state).invisible).length : states.length;

      if (secondaryTotal === 0) {
        return;
      }

      secondaryChildren.push(
        <li key={node.hash} className={cx('linked', { completed: secondaryProgress === secondaryTotal })}>
          <ProfileNavLink isActive={isActive} to={`/triumphs/${primaryHash}/${secondaryHash}/${node.hash}`}>
            <div className='name'>{node.displayProperties.name.length > 24 ? node.displayProperties.name.slice(0, 24) + '...' : node.displayProperties.name}</div>
            <div className='progress'>{secondaryProgress}/{secondaryTotal}</div>
          </ProfileNavLink>
        </li>
      );
    });

    return (
      <div className='node'>
        <div className='header'>
          <div className='name'>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            {primaryDefinition.displayProperties.name} <span>{primaryDefinition.children.presentationNodes.length !== 1 ? <>// {secondaryDefinition.displayProperties.name}</> : null}</span>
          </div>
        </div>
        <div className='children'>
          <ul
            className={cx('list', 'primary', {
              'single-primary': primaryDefinition.children.presentationNodes.length === 1
            })}
          >
            {primaryChildren}
          </ul>
          <ul className='list secondary'>{secondaryChildren}</ul>
        </div>
        <div className='records'>
          <ul className='list tertiary record-items'>
            <Records {...this.props} hashes={tertiaryDefinition.children.records.map(child => child.recordHash)} highlight={quaternaryHash} readLink={primaryHash === '564676571'} />
          </ul>
        </div>
      </div>
    );
  }
}

export default PresentationNode;
