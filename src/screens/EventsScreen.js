import React from 'react'
import { Text, ScrollView, View, } from 'react-native'
import { HeaderBackButton } from 'react-navigation'
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator'

import storage from '../globals/storage'
import EventList from '../components/EventList'
import { BASE_URL_PROD } from '../globals/constants'

export default class EventsScreen extends React.Component {
	static navigationOptions = ({ navigation }) => ({
		headerLeft: <HeaderBackButton
            onPress={() => {
                const { navigate } = navigation
                navigate('Profile')
            }}
            title='Profile'
        />,
        transitionConfig: () => ({
	        screenInterpolator: CardStackStyleInterpolator.forHorizontal,
	   }),
		title: 'Events'
	})

	constructor(props) {
		super(props)
		this.state = {
			events: false,
			auth: false,
			err: false,
		}
		this._getEventsAsync = this._getEventsAsync.bind(this);		
	}

	componentDidMount() {
		const auth = storage.load({
			key: 'auth',
		}).then(
			(auth) => this.setState({ auth: auth }, this._getEventsAsync)
		)
	}

	render() {
		const { navigate } = this.props.navigation;

		return (
			<ScrollView 
				// style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
				horizontal={false} 
				alwaysBounceHorizontal={false}
				>
				{
					this.state.events ? (
						<View style={{ flex: 1 }}>
							<EventList events={this.state.events} navigate={navigate} />
						</View>
					) : (
							<Text>Loading</Text>
						)
				}
				{this.state.err && <Text>Error: {this.state.err}</Text>}
			</ScrollView>
		)
	}

	_getEventsAsync = async () => {
		let eventsResponse = await fetch(
			BASE_URL_PROD + '/event/',
			{
				method: 'GET',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					Authorization: 'Bearer ' + this.state.auth.access_token
				}
			}
		);

		const eventsJson = await eventsResponse.json()

		if (eventsResponse.ok) {
			this.setState(prevState => {
				return Object.assign({}, prevState, 
					{
						events: eventsJson,
					}
				);
			});
		} else {
			this.setState(prevState => {
				return Object.assign({}, prevState, 
					{
						err: eventsResponse.statusCode,
					}
				);
			});
		}
	}
}
