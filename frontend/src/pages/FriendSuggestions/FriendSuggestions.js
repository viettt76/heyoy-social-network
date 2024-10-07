import clsx from 'clsx';
import styles from './FriendSuggestions.module.scss';
import Friend from '~/components/Friend';
import { useEffect, useState } from 'react';
import { getFriendSuggestionsService, sendFriendRequestService } from '~/services/relationshipServices';
import _ from 'lodash';

const FriendSuggestions = () => {
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const fetchCommonFriends = async () => {
            try {
                const res = await getFriendSuggestionsService();
                setSuggestions(res);
            } catch (error) {
                console.log(error);
            }
        };
        fetchCommonFriends();
    }, []);

    const handleSendFriendRequest = async (id) => {
        try {
            await sendFriendRequestService(id);
            setSuggestions((prev) => {
                const frs = _.filter(prev, (f) => f.id !== id);
                return frs;
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={clsx(styles['friends-wrapper'])}>
            {suggestions?.map((suggestion, index) => {
                return (
                    <Friend
                        className={clsx(styles['friend-wrapper'])}
                        key={`suggestion-${index}`}
                        type="friend-suggestion"
                        id={suggestion?.id}
                        firstName={suggestion?.firstName}
                        lastName={suggestion?.lastName}
                        avatar={suggestion?.avatar}
                        numberOfCommonFriends={suggestion?.numberOfCommonFriends}
                        handleSendFriendRequest={handleSendFriendRequest}
                    />
                );
            })}
        </div>
    );
};

export default FriendSuggestions;
