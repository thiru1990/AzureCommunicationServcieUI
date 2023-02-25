import { TeamsMeetingLinkLocator } from '@azure/communication-calling';
import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from '@azure/communication-common';
import {
  CallAndChatLocator,
  CallWithChatComposite,
  useAzureCommunicationCallWithChatAdapter,
  CallWithChatCompositeOptions
} from '@azure/communication-react';
import { Theme, PartialTheme, Spinner } from '@fluentui/react';
import { ChatClient } from '@azure/communication-chat';
import {
  CallComposite,
  ChatComposite,
  fromFlatCommunicationIdentifier,
  useAzureCommunicationCallAdapter,
  useAzureCommunicationChatAdapter
} from '@azure/communication-react';
import React, { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ENDPOINT_URL = 'https://cvscommunicationservice.communication.azure.com/';
const USER_ID = '8:acs:f56a770c-581e-4143-82a6-3d2734aa61d4_00000017-1ec2-42b5-f775-c93a0d00cf90';
const TOKEN = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwNiIsIng1dCI6Im9QMWFxQnlfR3hZU3pSaXhuQ25zdE5PU2p2cyIsInR5cCI6IkpXVCJ9.eyJza3lwZWlkIjoiYWNzOmY1NmE3NzBjLTU4MWUtNDE0My04MmE2LTNkMjczNGFhNjFkNF8wMDAwMDAxNy0xZWMyLTQyYjUtZjc3NS1jOTNhMGQwMGNmOTAiLCJzY3AiOjE3OTIsImNzaSI6IjE2NzcxNjU4OTUiLCJleHAiOjE2NzcyNTIyOTUsInJnbiI6ImluIiwiYWNzU2NvcGUiOiJjaGF0LHZvaXAiLCJyZXNvdXJjZUlkIjoiZjU2YTc3MGMtNTgxZS00MTQzLTgyYTYtM2QyNzM0YWE2MWQ0IiwicmVzb3VyY2VMb2NhdGlvbiI6ImluZGlhIiwiaWF0IjoxNjc3MTY1ODk1fQ.fjOoSZE3iqIHTx4KPsuLe8UxMudfjo8_vlrITE07adfafcTtGPfdq5ahgoHEjWK9qYnTvBKI6F4Bo5KIRhY6T9rCj466pRBenZJHHPPAANwnsg2u2KsZ1LCJjSg0ipQyfmC34DlPnhW2z0ACT6NOH43lW5pO1KmHEw8td-6HZJ16mGxb-7nmeBkUZtyy4YUeZJGqZbKv2cDpC2wQDNG4jgpGg8lsGSyPnkaE4_dFHmIsj2mx2mADoYxPFPpiQ3HShwcF9Lj4GqVU3jFArnnhQbfF1VlmNDq6DkcnzukzybNMTPaP4BANuUh93bSHOsO0S9xOnJuJK_LKjKRZdhVRnw';
const DISPLAY_NAME = 'Karthikeyan';
/**
 * Entry point of your application.
 */
function App(): JSX.Element {
  // Arguments that would usually be provided by your backend service or
  // (indirectly) by the user.
  const { endpointUrl, userId, token, displayName, groupId, threadId } = useAzureCommunicationServiceArgs();

  // A well-formed token is required to initialize the chat and calling adapters.
  const credential = useMemo(() => {
    try {
      return new AzureCommunicationTokenCredential(token);
    } catch {
      console.error('Failed to construct token credential');
      return undefined;
    }
  }, [token]);

  // Memoize arguments to `useAzureCommunicationCallAdapter` so that
  // a new adapter is only created when an argument changes.
  const callAdapterArgs = useMemo(
    () => ({
      userId: fromFlatCommunicationIdentifier(userId) as CommunicationUserIdentifier,
      displayName,
      credential,
      locator: { groupId }
    }),
    [userId, credential, displayName, groupId]
  );
  const callAdapter = useAzureCommunicationCallAdapter(callAdapterArgs);

  // Memoize arguments to `useAzureCommunicationChatAdapter` so that
  // a new adapter is only created when an argument changes.
  const chatAdapterArgs = useMemo(
    () => ({
      endpoint: endpointUrl,
      userId: fromFlatCommunicationIdentifier(userId) as CommunicationUserIdentifier,
      displayName,
      credential,
      threadId
    }),
    [endpointUrl, userId, displayName, credential, threadId]
  );
  const chatAdapter = useAzureCommunicationChatAdapter(chatAdapterArgs);

  if (!!callAdapter && !!chatAdapter) {
    return (
      <div style={{ height: '100vh', display: 'flex' }}>
        <div style={containerStyle}>
          <ChatComposite adapter={chatAdapter} />
        </div>
        <div style={containerStyle}>
          <CallComposite adapter={callAdapter} />
        </div>
      </div>
    );
  }
  if (credential === undefined) {
    return <h3>Failed to construct credential. Provided token is malformed.</h3>;
  }
  return <h3>Initializing...</h3>;
}
const containerStyle: CSSProperties = {
  border: 'solid 0.125rem olive',
  margin: '0.5rem',
  width: '50vw'
};

function useAzureCommunicationServiceArgs(): {
  endpointUrl: string;
  userId: string;
  token: string;
  displayName: string;
  groupId: string;
  threadId: string;
} {
  const [threadId, setThreadId] = useState('');
  // For the quickstart, create a new thread with just the local participant in it.
  useEffect(() => {
    (async () => {
      const client = new ChatClient(ENDPOINT_URL, new AzureCommunicationTokenCredential(TOKEN));
      const { chatThread } = await client.createChatThread(
        {
          topic: 'Composites Quickstarts'
        },
        {
          participants: [
            {
              id: fromFlatCommunicationIdentifier(USER_ID),
              displayName: DISPLAY_NAME
            }
          ]
        }
      );
      setThreadId(chatThread?.id ?? '');
    })();
  }, []);

  // For the quickstart, generate a random group ID.
  // The group Id must be a UUID.
  const groupId = useRef(uuidv4());

  return {
    endpointUrl: ENDPOINT_URL,
    userId: USER_ID,
    token: TOKEN,
    displayName: DISPLAY_NAME,
    groupId: groupId.current,
    threadId
  };
}

export type CallWithChatExampleProps = {
  // Props needed for the construction of the CallWithChatAdapter  
  userId:  CommunicationUserIdentifier;
  token:  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwNiIsIng1dCI6Im9QMWFxQnlfR3hZU3pSaXhuQ25zdE5PU2p2cyIsInR5cCI6IkpXVCJ9.eyJza3lwZWlkIjoiYWNzOmY1NmE3NzBjLTU4MWUtNDE0My04MmE2LTNkMjczNGFhNjFkNF8wMDAwMDAxNy0xZWMyLTQyYjUtZjc3NS1jOTNhMGQwMGNmOTAiLCJzY3AiOjE3OTIsImNzaSI6IjE2NzcxNjU4OTUiLCJleHAiOjE2NzcyNTIyOTUsInJnbiI6ImluIiwiYWNzU2NvcGUiOiJjaGF0LHZvaXAiLCJyZXNvdXJjZUlkIjoiZjU2YTc3MGMtNTgxZS00MTQzLTgyYTYtM2QyNzM0YWE2MWQ0IiwicmVzb3VyY2VMb2NhdGlvbiI6ImluZGlhIiwiaWF0IjoxNjc3MTY1ODk1fQ.fjOoSZE3iqIHTx4KPsuLe8UxMudfjo8_vlrITE07adfafcTtGPfdq5ahgoHEjWK9qYnTvBKI6F4Bo5KIRhY6T9rCj466pRBenZJHHPPAANwnsg2u2KsZ1LCJjSg0ipQyfmC34DlPnhW2z0ACT6NOH43lW5pO1KmHEw8td-6HZJ16mGxb-7nmeBkUZtyy4YUeZJGqZbKv2cDpC2wQDNG4jgpGg8lsGSyPnkaE4_dFHmIsj2mx2mADoYxPFPpiQ3HShwcF9Lj4GqVU3jFArnnhQbfF1VlmNDq6DkcnzukzybNMTPaP4BANuUh93bSHOsO0S9xOnJuJK_LKjKRZdhVRnw';
  displayName: 'Communication App';
  endpointUrl:  'https://cvscommunicationservice.communication.azure.com/';
 
  /**
   * For CallWithChat you need to provide either a teams meeting locator or a CallAndChat locator
   * for the composite
   *
   * CallAndChatLocator: This locator is comprised of a groupId call locator and a chat thread
   * threadId for the session. See documentation on the {@link CallAndChatLocator} to see types of calls supported.
   * {callLocator: ..., threadId: ...}
   *
   * TeamsMeetingLinkLocator: this is a special locator comprised of a Teams meeting link
   * {meetingLink: ...}
   */
  locator: TeamsMeetingLinkLocator | CallAndChatLocator;

  // Props to customize the CallWithChatComposite experience
  fluentTheme?: PartialTheme | Theme;
  compositeOptions?: CallWithChatCompositeOptions;
  callInvitationURL?: 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_MTI0MjRlMTItOWMwOC00NmFhLTkzMTEtM2RiZjkyOWFhZjc5%40thread.v2/0?context=%7b%22Tid%22%3a%22de08c407-19b9-427d-9fe8-edf254300ca7%22%2c%22Oid%22%3a%22b9b41804-e61a-40fb-b925-26f70058b086%22%7d';
  formFactor?: 'desktop' | 'mobile';
};

export const CallWithChatExperience = (props: CallWithChatExampleProps): JSX.Element => {
  // Construct a credential for the user with the token retrieved from your server. This credential
  // must be memoized to ensure useAzureCommunicationCallWithChatAdapter is not retriggered on every render pass.
  const credential = useMemo(() => new AzureCommunicationTokenCredential(props.token), [props.token]);

  // Create the adapter using a custom react hook provided in the @azure/communication-react package.
  // See https://aka.ms/acsstorybook?path=/docs/composite-adapters--page for more information on adapter construction and alternative constructors.
  const adapter = useAzureCommunicationCallWithChatAdapter({
    //userId: fromFlatCommunicationIdentifier(USER_ID) as CommunicationUserIdentifier,
    userId: props.userId,
    displayName: props.displayName,
    credential,
    locator: props.locator,
    endpoint: props.endpointUrl
  });

  // The adapter is created asynchronously by the useAzureCommunicationCallWithChatAdapter hook.
  // Here we show a spinner until the adapter has finished constructing.
  if (!adapter) {
    return <Spinner label="Initializing..." />;
  }

  return (
    <CallWithChatComposite
      adapter={adapter}
      fluentTheme={props.fluentTheme}
      formFactor={props.formFactor}
      joinInvitationURL={props.callInvitationURL}
      options={props.compositeOptions}
    />
  );
}
export default App;