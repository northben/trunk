
# encoding = utf-8

import os
import sys
import time
import datetime
import json

def validate_input(helper, definition):
    pass

def collect_events(helper, ew):
    token = helper.get_arg('trello_token')
    TRELLO_API_KEY = helper.get_arg('trello_key')
    oldest_action  = helper.get_check_point('oldest_action')
    newest_action  = helper.get_check_point('newest_action')
    index = helper.get_output_index()
    sourcetype = helper.get_sourcetype()
    input_type = helper.get_input_type() + '://' + helper.get_arg('trello_token')

    params = {'token': token, 'key': TRELLO_API_KEY}

    r = helper.send_http_request('https://api.trello.com/1/members/me/boards',
        'get', parameters=params, payload=None, headers=None, cookies=None, verify=True, cert=None,
        timeout=None, use_proxy=True)
    response_json = r.json()
    boards = [r['shortLink'] for r in response_json]

    helper.log_warning("looping through boards")
    for board_id in boards:

        key = 'oldest_action_{}'.format(board_id)
        helper.log_warning("getting checkpoint key: {}".format(key))
        oldest_action = helper.get_check_point(key)
        helper.log_warning("got checkpoint value: {}".format(oldest_action))

        if oldest_action is None:
            helper.log_warning("first run - no oldest action")
            params.pop('since', None)
            while True:
                url = 'https://api.trello.com/1/boards/{board_id}/actions'.format(board_id=board_id)
                helper.log_warning("requesting: {}".format(url))
                helper.log_warning("requesting params: {}".format(params))
                r = helper.send_http_request(url,
                    'get', parameters=params, payload=None, headers=None, cookies=None, verify=True, cert=None,
                    timeout=None, use_proxy=True)
                response_json = r.json()
                if len(response_json) == 0:
                    helper.log_warning("response was 0 length")
                    break
                else:
                    for data in response_json:
                        helper.log_warning("saving event")
                        event = helper.new_event(source=input_type, index=index, sourcetype=sourcetype, data=json.dumps(data))
                        ew.write_event(event)
                    key = 'oldest_action_{}'.format(board_id)
                    helper.log_warning("saving oldest checkpoint key: {}".format(key))
                    oldest_action = sorted([a['date'] for a in response_json])[0]
                    helper.save_check_point(key, oldest_action)
                    params.update({'before': oldest_action})

                    key = 'newest_action_{}'.format(board_id)
                    if helper.get_check_point(key) is None:
                        helper.log_warning("no newest action, saving checkpoint for key: {}".format(key))
                        helper.save_check_point(key, sorted([a['date'] for a in response_json])[-1])

        else:
            helper.log_warning('not first run')
            # get new actions since last import
            key = 'newest_action_{}'.format(board_id)
            newest_checkpoint = helper.get_check_point(key)
            helper.log_warning('newest checkpoint value: {}'.format(newest_checkpoint))
            if newest_checkpoint is None:
                raise Exception("didn't expect this")
            params.update({'since': newest_checkpoint})
            params.pop('before', None)
            url = 'https://api.trello.com/1/boards/{board_id}/actions'.format(board_id=board_id)
            helper.log_warning("requesting: {}".format(url))
            helper.log_warning("requesting params: {}".format(params))
            r = helper.send_http_request(url,
                'get', parameters=params, payload=None, headers=None, cookies=None, verify=True, cert=None,
                timeout=None, use_proxy=True)
            response_json = r.json()
            helper.log_warning('json next')
            helper.log_warning(response_json)
            for data in response_json:
                helper.log_warning('got data')
                event = helper.new_event(source=input_type, index=index, sourcetype=sourcetype, data=json.dumps(data))
                ew.write_event(event)
            if len(response_json):
                key = 'newest_action_{}'.format(board_id)
                helper.log_warning('saving checkpoint for key: {}'.format(key))
                newest_action = sorted([a['date'] for a in response_json])[-1]
                helper.save_check_point(key, newest_action)
