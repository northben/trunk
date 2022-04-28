import splunk
from cloner_utils import *
from urllib import unquote_plus, quote_plus
from urlparse import parse_qsl
import requests

splunkd_time_out = 15

logger = setup_logger('trunk')

class CreateCard(splunk.rest.BaseRestHandler):

    def get_trello_credentials(self, input_name):
        uri = '/services/data/inputs/trello_team/{}'.format(input_name)
        serverResponse, serverContent = splunk.rest.simpleRequest(
            uri + '?output_mode=json',
            sessionKey=self.sessionKey,
            postargs=None,
            method='GET',
            raiseAllErrors=True,
            proxyMode=False,
            rawResult=None,
            jsonargs=None,
            timeout=splunkd_time_out
        )

        serverContent = json.loads(serverContent)['entry'][0]['content']
        trello_credentials = {}
        trello_credentials['trello_team'] = serverContent['trello_team']
        trello_credentials['trello_key'] = serverContent['trello_key']

        # get Trello token
        unescaped_input_name = unquote_plus(input_name)
        uri_format = "#{app}#data/inputs/{input_type}:{input_name}``splunk_cred_sep``1:".format(
            app="TA-trello-webhook",
            input_type="trello_team",
            input_name=unescaped_input_name,
            )

        uri_format = quote_plus(uri_format)
        uri = '/servicesNS/-/-/storage/passwords/__REST_CREDENTIAL__' + uri_format
        logger.info(uri)
        serverResponse, serverContent = splunk.rest.simpleRequest(
            uri + '?output_mode=json',
            sessionKey=self.sessionKey,
            postargs=None,
            method='GET',
            raiseAllErrors=True,
            proxyMode=False,
            rawResult=None,
            jsonargs=None,
            timeout=splunkd_time_out
        )

        serverContent = json.loads(serverContent)['entry'][0]['content']
        trello_token = json.loads(serverContent['clear_password'])['trello_token']
        trello_credentials['trello_token'] = trello_token
        logger.info('returning trello credentials')

        return trello_credentials

    def add_comment_to_card(self, card_id, comment):
        comment_payload = {
            "text": comment,
            "token": self.trello_token,
            "key": self.trello_key,
        }

        r = requests.post('https://api.trello.com/1/cards/{card_id}/actions/comments'.format(card_id=card_id), params=comment_payload)
        response_data = json.loads(r.text)['data']['card']
        return response_data

    def add_label_to_card(self, card_id, label):
        payload = {
            "name": label,
            "token": self.trello_token,
            "key": self.trello_key,
            "color": "green",
        }

        logger.info("here")
        r = requests.post('https://api.trello.com/1/cards/{card_id}/labels'.format(card_id=card_id), params=payload)
        logger.info(r.text)
        response_data = json.loads(r.text)
        return response_data

    def handle_POST(self):
        logger.info("in Python!")

        trello_credentials = self.get_trello_credentials('splunkps')
        self.trello_token = trello_credentials['trello_token']
        self.trello_key = trello_credentials['trello_key']

        try:
            payload = unquote_plus(self.request['payload'])
            payload = dict(parse_qsl(payload))
            target_list = payload['target_list']
            card_title = payload['title']
            comment = payload.get('comment')
            label = payload.get('label')

            base_url = 'name={card_title}&idList={target_list}&token={trello_token}&key={trello_key}'
            trello_payload = base_url.format(
                target_list=target_list,
                card_title=card_title,
                trello_token=self.trello_token,
                trello_key=self.trello_key,
            )

            trello_request = requests.post('https://api.trello.com/1/cards', params=trello_payload)
            trello_response = json.loads(trello_request.text)

            if comment:
                card_id = trello_response['id']
                trello_response.update(self.add_comment_to_card(card_id, comment))

            if label:
                logger.info("got a label: " + label)
                card_id = trello_response['id']
                trello_response['label'] = self.add_label_to_card(card_id, label)

            logger.info(trello_response)

            self.response.write(json.dumps(trello_response))

        except Exception, e:
            self.response.write(e)

